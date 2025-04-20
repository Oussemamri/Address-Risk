# Address Risk API

A NestJS-based API service that allows you to register French addresses and retrieve associated risk information.

## 🌟 Features

- **Address Registration**: Search and store addresses using the French National Address Database (BAN)
- **Risk Assessment**: Retrieve natural and technological risk information for registered addresses
- **Dockerized**: Easily deployable with Docker and Docker Compose
- **Persistent Storage**: SQLite database with volume mounting for data persistence

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (for containerized setup)
- Node.js 20+ and npm (for local development)

## 🚀 Quick Start with Docker

### Clone the repository

```bash
git clone https://github.com/yourusername/address-risk-api.git
cd address-risk-api
```

### Run with Docker Compose

```bash
# Build the Docker image
docker compose build

# Start the application
docker compose up
```

The API will be available at http://localhost:8000

## 🔧 Manual Setup (Development)

```bash
# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Run in development mode
npm run start:dev
```

## 🔌 API Endpoints

### 1. Register an Address

Searches for an address and stores it in the database.

**Endpoint:**
```
POST /api/addresses
```

**Request Body:**
```json
{
  "q": "8 bd du Port, Sarzeau"
}
```

**Responses:**

✅ **200 OK** - Address found and stored
```json
{
  "id": 1,
  "label": "8 bd du Port, 56170 Sarzeau",
  "housenumber": "8",
  "street": "bd du Port",
  "postcode": "56170",
  "citycode": "56242",
  "latitude": 47.58234,
  "longitude": -2.73745
}
```

❌ **400 Bad Request** - Invalid input
```json
{
  "error": "Le champ 'q' est requis et doit être une chaîne non vide."
}
```

❌ **404 Not Found** - Address not found
```json
{
  "error": "Adresse non trouvée. Aucun résultat ne correspond à votre recherche."
}
```

❌ **500 Internal Server Error** - External API error
```json
{
  "error": "Erreur serveur : impossible de contacter l'API externe."
}
```

### 2. Get Risks for an Address

Retrieves risk information for a previously registered address.

**Endpoint:**
```
GET /api/addresses/{id}/risks
```

**Parameters:**
- `id` - The ID of the stored address (integer)

**Responses:**

✅ **200 OK** - Risk data retrieved successfully
```json
{
  "code": "OK",
  "data": {
    "commune": {
      "code_insee": "56242",
      "nom": "Sarzeau",
      "risques": [
        {
          "type": "Inondation",
          "niveau": "Moyen",
          "description": "Zone potentiellement inondable"
        },
        {
          "type": "Retrait-gonflement des argiles",
          "niveau": "Faible",
          "description": "Aléa faible"
        }
      ]
    },
    "adresse": {
      "latitude": 47.58234,
      "longitude": -2.73745,
      "adresse": "8 bd du Port, 56170 Sarzeau"
    }
  }
}
```

❌ **404 Not Found** - Address ID not found
```json
{
  "error": "Adresse non trouvée."
}
```

❌ **500 Internal Server Error** - External API error
```json
{
  "error": "Erreur serveur : échec de la récupération des données de Géorisques."
}
```

## 🌐 External APIs Used

- **BAN (Base Adresse Nationale)**: To search and validate French addresses
  - Endpoint: `https://api-adresse.data.gouv.fr/search/`
  
- **Géorisques**: To retrieve natural and technological risks data
  - Endpoint: `https://www.georisques.gouv.fr/api/v3/v1/resultats_rapport_risque`

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TYPEORM_CONNECTION` | Database type | sqlite |
| `TYPEORM_DATABASE` | Database file path | /data/db.sqlite |
| `PORT` | Server port | 8000 |

## 🧪 Testing

Run the test suite with:

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🏗️ Project Structure

The project follows NestJS's modular architecture:

```
src/
├── addresses/              # Address module
│   ├── dto/                # Data Transfer Objects
│   ├── entities/           # Database entities
│   ├── addresses.controller.ts
│   ├── addresses.service.ts
│   └── addresses.module.ts
├── app.module.ts           # Main application module
└── main.ts                 # Application entry point
```

## 🛠️ Technical Details

- **Framework**: NestJS (TypeScript)
- **ORM**: TypeORM with SQLite
- **Validation**: class-validator
- **API Client**: axios
- **Testing**: Jest

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.