# Guide d'Intégration des APIs de Paiement
## SubPay Africa — Documentation Technique

---

## 1. Orange Money API

### 1.1 Couverture
- Cameroun (XAF)
- DRC (CDF)
- Burkina Faso (XOF)
- Gabon (XAF)

### 1.2 Endpoints Principaux

**Base URL**: `https://api.orange.com/orange-money-webpay/`

**Authentification**: OAuth 2.0 — Client Credentials Flow

```bash
POST https://api.orange.com/oauth/v3/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}
```

**Initialiser un paiement**:
```bash
POST /dev/v1/webpayment
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "merchant_key": "MERCHANT_KEY",
  "currency": "XAF",
  "order_id": "ORDER_123",
  "amount": 6100,
  "return_url": "https://subpay.africa/callback/orange",
  "cancel_url": "https://subpay.africa/cancel",
  "notif_url": "https://subpay.africa/webhook/orange",
  "lang": "fr",
  "reference": "Abonnement Netflix Standard"
}
```

**Réponse**:
```json
{
  "status": "SUCCESS",
  "message": "Payment initialized",
  "data": {
    "payment_token": "TOKEN_XYZ",
    "payment_url": "https://webpayment.orange.com/...",
    "notif_token": "NOTIF_TOKEN"
  }
}
```

**Webhook de Confirmation**:
```json
{
  "status": "SUCCESS",
  "txnid": "OM_CI_20240315_ABC123",
  "txnmessage": "Payment successfully processed",
  "orderId": "ORDER_123",
  "amount": 6100,
  "currency": "XAF",
  "subscriberMsisdn": "237691234567"
}
```

### 1.3 Sandbox Orange Money

```
URL Sandbox: https://api.orange.com/orange-money-webpay/cm/v1
Numéro test: 237691234567
PIN test: 1234
```

---

## 2. MTN Mobile Money (MoMo) API

### 2.1 Couverture
- Cameroun (XAF)
- Congo-Brazzaville (XAF)

### 2.2 Endpoints Principaux

**Base URL**: `https://sandbox.momodeveloper.mtn.com`

**Authentification**: API Key + Basic Auth

```bash
# Créer un API User
POST /v1_0/apiuser
X-Reference-Id: {UUID}
Ocp-Apim-Subscription-Key: {PRIMARY_KEY}

{"providerCallbackHost": "webhook.subpay.africa"}
```

**Initier Collection (paiement entrant)**:
```bash
POST /collection/v1_0/requesttopay
Authorization: Bearer {ACCESS_TOKEN}
X-Reference-Id: {UUID}
X-Target-Environment: sandbox
Ocp-Apim-Subscription-Key: {COLLECTION_KEY}

{
  "amount": "6100",
  "currency": "XAF",
  "externalId": "ORDER_123",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "237671234567"
  },
  "payerMessage": "Paiement Netflix Standard SubPay",
  "payeeNote": "SubPay Africa - Netflix"
}
```

**Vérifier statut**:
```bash
GET /collection/v1_0/requesttopay/{referenceId}
Authorization: Bearer {ACCESS_TOKEN}
```

**Réponse statut**:
```json
{
  "financialTransactionId": "23503452",
  "externalId": "ORDER_123",
  "amount": "6100",
  "currency": "XAF",
  "payer": {"partyIdType": "MSISDN", "partyId": "237671234567"},
  "status": "SUCCESSFUL"
}
```

### 2.3 Sandbox MTN MoMo

```
URL: https://sandbox.momodeveloper.mtn.com
Numéro test: 46733123450
Statut: SUCCESSFUL (par défaut en sandbox)
```

---

## 3. Airtel Money API

### 3.1 Couverture
- DRC (CDF)
- Congo-Brazzaville (XAF)
- Gabon (XAF)

### 3.2 Endpoints Principaux

**Base URL**: `https://openapi.airtel.africa`

**Authentification**: OAuth 2.0

```bash
POST /auth/oauth2/token
Content-Type: application/json

{
  "client_id": "CLIENT_ID",
  "client_secret": "CLIENT_SECRET",
  "grant_type": "client_credentials"
}
```

**Initier paiement (Collection)**:
```bash
POST /merchant/v1/payments/
Authorization: Bearer {TOKEN}
X-Currency: CDF
X-Country: CD
Content-Type: application/json

{
  "reference": "ORDER_123",
  "subscriber": {
    "country": "CD",
    "currency": "CDF",
    "msisdn": "243812345678"
  },
  "transaction": {
    "amount": 28000,
    "country": "CD",
    "currency": "CDF",
    "id": "TX_UUID_123"
  }
}
```

**Webhook Airtel**:
```json
{
  "transaction": {
    "id": "TX_UUID_123",
    "message": "Paid",
    "status_code": "TS",
    "airtel_money_id": "CI2403151234"
  }
}
```

### 3.3 Pays et Codes ISO

| Pays | Code ISO | Devise |
|------|----------|--------|
| DRC | CD | CDF |
| Congo-B | CG | XAF |
| Gabon | GA | XAF |

---

## 4. Reloadly API (Abonnements & Codes)

### 4.1 Vue d'Ensemble

Reloadly permet d'acheter instantanément des codes/cartes cadeaux pour Netflix, Spotify, Apple Music, PSN et bien d'autres services dans le monde entier.

**Base URL**: `https://giftcards.reloadly.com`
**Sandbox**: `https://giftcards-sandbox.reloadly.com`

### 4.2 Authentification

```bash
POST https://auth.reloadly.com/oauth/token
Content-Type: application/json

{
  "client_id": "RELOADLY_CLIENT_ID",
  "client_secret": "RELOADLY_SECRET",
  "grant_type": "client_credentials",
  "audience": "https://giftcards.reloadly.com"
}
```

### 4.3 Lister les Produits Disponibles

```bash
GET /products?productName=Netflix&countryCode=CM&size=10
Authorization: Bearer {TOKEN}
Accept: application/com.reloadly.giftcards-v1+json
```

**Réponse**:
```json
{
  "content": [
    {
      "productId": 10,
      "productName": "Netflix Gift Card",
      "countryCode": "US",
      "denomination": {
        "type": "FIXED",
        "fixedList": [15, 25, 50, 100]
      },
      "redeemInstructionUrl": "https://www.netflix.com/redeem",
      "brand": {
        "brandId": 5,
        "brandName": "Netflix"
      }
    }
  ]
}
```

### 4.4 Acheter un Code (Order)

```bash
POST /orders
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "productId": 10,
  "quantity": 1,
  "unitPrice": 15,
  "customIdentifier": "ORDER_123",
  "senderName": "SubPay Africa",
  "recipientEmail": "user@example.com",
  "recipientPhoneDetails": {
    "countryCode": "CM",
    "phoneNumber": "237671234567"
  }
}
```

**Réponse**:
```json
{
  "transactionId": 1234567,
  "status": "SUCCESSFUL",
  "product": {
    "productId": 10,
    "productName": "Netflix Gift Card $15",
    "countryCode": "US"
  },
  "smsSent": true,
  "emailSent": false,
  "transactions": {
    "id": 1234567,
    "status": "SUCCESSFUL"
  },
  "redeemedAt": "2024-03-15",
  "rewards": [
    {
      "cardsPerTransaction": 1,
      "cards": [
        {
          "cardNumber": "XXXXXXXXXXX",
          "pinCode": "XXXX",
          "redemptionURL": "https://www.netflix.com/redeem"
        }
      ]
    }
  ]
}
```

### 4.5 Produits par Service

| Service | ProductID (Prod) | Dénominations USD |
|---------|-----------------|------------------|
| Netflix Gift Card | 10 | $15, $25, $50 |
| Spotify Gift Card | 1839 | $10, $30, $60 |
| Apple iTunes | 12 | $5, $10, $25, $50, $100 |
| PlayStation Network | 532 | $10, $20, $50 |

---

## 5. Deep Links vers les Applications

### 5.1 Netflix
```
iOS/Android App: nflx://netflix.com/redeem
Web fallback: https://www.netflix.com/redeem
```

### 5.2 Spotify
```
iOS/Android: spotify://redeem
Web fallback: https://www.spotify.com/redeem
```

### 5.3 Apple Music / iTunes
```
iOS: itms-apps://apps.apple.com/redeem
Android: https://apps.apple.com/redeem
Lien universel: https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/redeemGiftCode
```

### 5.4 PlayStation Network (PSN)
```
iOS: com.playstation.remoteplay://
Android: com.playstation.mobileshop://
Web: https://store.playstation.com/redeem
```

---

## 6. Taux de Change en Temps Réel

**API recommandée**: ExchangeRate-API ou Open Exchange Rates

```bash
GET https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD
```

**Devises supportées**:
| Devise | Code | Pays |
|--------|------|------|
| Franc Congolais | CDF | DRC |
| Franc CFA (CEMAC) | XAF | Cameroun, Gabon, Congo-B |
| Franc CFA (UEMOA) | XOF | Burkina Faso |

---

## 7. Variables d'Environnement Requises

```env
# Orange Money
ORANGE_CLIENT_ID=
ORANGE_CLIENT_SECRET=
ORANGE_MERCHANT_KEY_CM=   # Cameroun
ORANGE_MERCHANT_KEY_CD=   # DRC
ORANGE_MERCHANT_KEY_BF=   # Burkina Faso

# MTN MoMo
MTN_SUBSCRIPTION_KEY_COLLECTION=
MTN_API_USER_CM=
MTN_API_KEY_CM=
MTN_TARGET_ENV=sandbox  # ou production

# Airtel Money
AIRTEL_CLIENT_ID=
AIRTEL_CLIENT_SECRET=

# Reloadly
RELOADLY_CLIENT_ID=
RELOADLY_CLIENT_SECRET=

# Exchange Rate
EXCHANGE_RATE_API_KEY=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/subpay
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Notifications
EXPO_ACCESS_TOKEN=
AFRICAS_TALKING_API_KEY=
AFRICAS_TALKING_USERNAME=
```

---

*Guide technique SubPay Africa — Version 1.0 — Mars 2026*
