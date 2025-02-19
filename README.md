# 🍽️ Restaurant Management System

## 🚀 Project Overview
The **Restaurant Management System** is a comprehensive platform designed to streamline and manage restaurant operations effectively. This system offers features like menu management, dining reservations, staff management, and an intuitive user interface for both customers and staff.

## 📂 Project Structure
```
Restaurant-Management-System/
├── controllers/
│   ├── cartController.js
│   ├── customerController.js
│   ├── diningController.js
│   ├── functionController.js
│   ├── menuController.js
│   └── staffController.js
├── public/
│   ├── css/
│   ├── images/
│   └── javascripts/
├── routes/
│   ├── cart.js
│   ├── dining.js
│   ├── menu.js
│   ├── menudisplay.js
│   └── staff.js
├── views/
│   ├── cart.ejs
│   ├── dining.ejs
│   ├── land.ejs
│   ├── menu.ejs
│   ├── menudisplay.ejs
│   ├── staff.ejs
│   └── thankYou.ejs
├── db.js
├── index.js
├── package.json
└── package-lock.json
```

## ✨ Key Features
- **Menu Management:** Create, read, update, and delete menu items.
- **Dining Reservations:** Users can book dining tables in advance.
- **Staff Management:** Admins can manage staff details.
- **Cart Management:** Customers can add items to their cart and proceed to checkout.
- **Responsive Design:** Ensures usability across devices.

## ⚙️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript, EJS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## 📦 Installation
1. **Clone the repository:**
```bash
git clone https://github.com/Uditgupta08/Restaurant-Management-System.git
cd Restaurant-Management-System
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up the database:**
- Make sure MongoDB is running locally or provide a remote connection string in `.env` file.

4. **Run the application:**
```bash
npm start
```

5. **Access in browser:**
```
http://localhost:3000
```

## 🛠️ Usage
- **Customer:** Can view the menu, make reservations, and place orders.
- **Admin:** Can manage menu items, staff, and reservations.

## 💡 Future Enhancements
- **Payment Integration:** Allow online payments.
- **Analytics Dashboard:** Provide insights into sales and reservations.
- **User Authentication:** Add login and registration features.

---

Feel free to reach out for any queries or support regarding this project!

