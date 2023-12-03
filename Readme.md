# User API

This User API provides a set of endpoints to facilitate user-related operations, including user registration, login, fetching user details, updating user profiles, deleting user accounts, and logging out.

## Installation

To set up and run the calculator API locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

## Postman collection link 
- [click here](https://www.postman.com/sonarnks/workspace/vyld-backend-assignment/collection/28600942-73257cd7-10b9-45a2-aae3-f10338e2b16d?action=share&creator=28600942)

### Steps

**Clone the Repository:**

```
git clone https://github.com/sahnavin123/user-api.git
```

### Install the dependency

```
npm install
```

### set up environment variables

```
PORT=YOUR_PORT_NUMBER
MONGODB_URI=YOUR_MONGO_DB_URI
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY=_ACCESS_TOKEN_EXPIRY_DATE

```

### Run the Application

```
npm start
```

The application will be accessible at http://localhost:8000

## Endpoints

### 1. Register and Login

#### Register
- **Endpoint:** /api/users/register
- **Method:** POST
- **Functionality:** Allows a new user to create an account.
- **Input:**
  - Name, username, bio, age, password.
- **Output:**
  - Confirmation of account creation, user details.

#### Login
- **Endpoint:** /api/users/login
- **Method:** POST
- **Functionality:** Authenticates an existing user.
- **Input:**
  - Username and password.
- **Output:**
  - Authentication token, user details.

### 2. Get User Details

- **Endpoint:** /api/users/details
- **Method:** GET
- **Functionality:** Retrieves the details of the logged-in user.
- **Input:**
  - User's authentication token.
- **Output:**
  - User's details (name, username, bio, age).

### 3. Update User Details

- **Endpoint:** /api/users/update
- **Method:** PUT
- **Functionality:** Allows a user to update their profile details.
- **Input:**
  - User's authentication token.
  - Updated details (name, username, bio, age).
- **Output:**
  - Confirmation of update, updated user details.

### 4. Delete User Account

- **Endpoint:** /api/users/delete
- **Method:** DELETE
- **Functionality:** Allows a user to permanently delete their account.
- **Input:**
  - User's authentication token.
  - password
- **Output:**
  - Confirmation of account deletion.

### 5. User Logout

- **Endpoint:** /api/users/logout
- **Method:** POST
- **Functionality:** Logs out the user, invalidating their current authentication token.
- **Input:**
  - User's authentication token.
- **Output:**
  - Confirmation of logout.
