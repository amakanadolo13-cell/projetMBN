import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { formatPhone } from '../config/countries';

function generateTokens(userId: string, role: string, country: string) {
  const accessToken = jwt.sign(
    { userId, role, country },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { phone, password, firstName, lastName, country } = req.body;

    if (!phone || !password || !country) {
      res.status(400).json({ success: false, message: 'Téléphone, mot de passe et pays requis' });
      return;
    }

    const formattedPhone = formatPhone(phone, country);

    const existing = await prisma.user.findUnique({ where: { phone: formattedPhone } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Ce numéro est déjà enregistré' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        phone: formattedPhone,
        passwordHash,
        firstName,
        lastName,
        country,
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        country: true,
        role: true,
        createdAt: true,
      },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.country);

    // Stocker le refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { phone, password, country } = req.body;

    if (!phone || !password) {
      res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis' });
      return;
    }

    const formattedPhone = country ? formatPhone(phone, country) : phone;

    const user = await prisma.user.findUnique({ where: { phone: formattedPhone } });
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.country);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function refreshTokens(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token requis' });
      return;
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
      return;
    }

    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    } catch {
      res.status(401).json({ success: false, message: 'Token invalide' });
      return;
    }

    // Révoquer l'ancien token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const { user } = storedToken;
    const tokens = generateTokens(user.id, user.role, user.country);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ success: true, data: tokens });
  } catch (err) {
    console.error('[Auth] Refresh error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function updatePushToken(req: Request & { userId?: string }, res: Response): Promise<void> {
  try {
    const { pushToken } = req.body;

    await prisma.user.update({
      where: { id: req.userId },
      data: { pushToken },
    });

    res.json({ success: true, message: 'Push token mis à jour' });
  } catch (err) {
    console.error('[Auth] Push token error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getMe(req: Request & { userId?: string }, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        role: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}
