var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const session = require("express-session");
var logger = require("morgan");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require('fs');

const multer = require("multer");


const vehicle_storage = multer.diskStorage({
  destination : (req, file, cb) =>{
    const destinationFolder = 'public/images/vehicles';
        // Check if the destination folder exists, create it if not
      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
      }
    cb(null, destinationFolder)
  },
  filename:(req, file, cb)=>{
    console.log(file)
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const profile_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationFolder = 'public/images/profiles';
    // Check if the destination folder exists, create it if not
    if (!fs.existsSync(destinationFolder)) {
      console.log('Creating destination folder:');
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload_car = multer({storage: vehicle_storage})
const upload_profile_pic = multer({storage: profile_storage})


const nodemailer = require("nodemailer");

// Create a transporter using your Gmail credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "botauto212@gmail.com",
    pass: "cjeifgsiqfivevdx",
  },
});

const userTypes = {
  student: "Student",
  admin: "Admin",
  driver: "Driver",
};

let driver = { lat: null, long: null };
let users = [];
let cars = [];

let rideRequests = [];

const rideStatus = {
  requested: "Requested",
  opened: "Opened",
  accepted: "Accepted",
  closed: "Closed",
};

const vehicleAvailStat = {
  available: "Available",
  booked: "Booked",
};

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouterRegister = require("./routes/register");
var authRouterLogin = require("./routes/login");

let adminUser = {
  id: 1,
  disabled : false,
  drivercode: "USER101",
  name: "Cab ",
  profileUrl : "https://img.freepik.com/free-vector/illustration-user-avatar-icon_53876-5907.jpg?w=826&t=st=1692809729~exp=1692810329~hmac=1c15c77c5215eb33e58e711a8d8546a9794db975489ad46227b39363fbe632fc",
  surname: "TeJayy",
  usertype: userTypes.admin,
  email: "admin@infinite.com",
  phone: "82389893",
  password: "admin",
};
let inifiniTechUser = {
  id: 6,
  disabled : false,
  drivercode: "ADMIN123",
  name: "Percyval",
  profileUrl : "https://img.freepik.com/free-vector/illustration-user-avatar-icon_53876-5907.jpg?w=826&t=st=1692809729~exp=1692810329~hmac=1c15c77c5215eb33e58e711a8d8546a9794db975489ad46227b39363fbe632fc",
  surname: "Infini",
  usertype: userTypes.admin,
  email: "percyval@gmail.com",
  phone: "82389893",
  password: "Percyval123",
};
let StudentUser = {
  id: 2,
  disabled : true,
  drivercode: "None",
  profileUrl : "https://img.freepik.com/free-vector/illustration-user-avatar-icon_53876-5907.jpg?w=826&t=st=1692809729~exp=1692810329~hmac=1c15c77c5215eb33e58e711a8d8546a9794db975489ad46227b39363fbe632fc",
  name: "Andile",
  phone: "0723074089",
  surname: "Masilela",
  usertype: userTypes.student,
  email: "student@infinite.com",
  password: "student",
};
let StudentUser2 = {
  id: 3,
  drivercode: "None",
  disabled : false,
  profileUrl : "https://img.freepik.com/free-vector/illustration-user-avatar-icon_53876-5907.jpg?w=826&t=st=1692809729~exp=1692810329~hmac=1c15c77c5215eb33e58e711a8d8546a9794db975489ad46227b39363fbe632fc",
  name: "Victor",
  surname: "Mahluza",
  usertype: userTypes.student,
  email: "victor@infinite.com",
  password: "123",
};
let DriverUser1 = {
  id: 4,
  disabled : false,
  profileUrl : "https://img.freepik.com/free-vector/illustration-user-avatar-icon_53876-5907.jpg?w=826&t=st=1692809729~exp=1692810329~hmac=1c15c77c5215eb33e58e711a8d8546a9794db975489ad46227b39363fbe632fc",
  drivercode: "USER200",
  name: "AndileAs Driver",
  surname: "Masilela",
  phone: "2783782783",
  usertype: userTypes.driver,
  email: "driver@infinite.com",
  password: "driver2",
};
let DriverUser2 = {
  id: 5,
  disabled : true,
  profileUrl : "https://img.freepik.com/free-vector/illustration-user-avatar-icon_53876-5907.jpg?w=826&t=st=1692809729~exp=1692810329~hmac=1c15c77c5215eb33e58e711a8d8546a9794db975489ad46227b39363fbe632fc",
  drivercode: "USER201",
  name: "Vic as Driver",
  surname: "Masilela",
  usertype: userTypes.driver,
  phone: "0723074089",
  email: "driver2@infinite.com",
  password: "student",
};

let adminCar = {
  id: 1,
  name: "Mercedes Sprinter",
  condition: "Good",
  dest_id: 2,
  status: "booked",
  drivercode: "USER100",
  plate: "GDB 203 MP",
  seats: 15,
  imageUrl: "images/vehicle1.jpg",
};
let userCar = {
  id: 2,
  name: "Golf 5 X9",
  condition: "Good",
  status: "booked",
  dest_id: 1,
  drivercode: "USER200",
  plate: "MAH 200 MP",
  seats: 15,
  imageUrl: "images/vehicle2.jpg",
};
let userCar2 = {
  id: 1,
  name: "Golf 5 X9",
  condition: "Good",
  status: "booked",
  dest_id: 1,
  drivercode: "USER200",
  plate: "MAH 200 MP",
  seats: 15,
  imageUrl: "images/vehicle2.jpg",
};
let destination_locations = [];

const demLocation = {
  id: 1,
  name: "West Houst",
  addressline1: "Kamagugu",
  addressline2: "Apt 4B",
  town_city: "Springfield",
  province: "IL",
  latitude: 39.7817, // Replace with actual latitude value
  longitude: -89.6501, // Replace with actual longitude value
};
const demLocation1 = {
  id: 2,
  name: "Ilanaga Holdings",
  addressline1: "West Acres",
  addressline2: "Unit 8",
  town_city: "Cedarville",
  province: "CA",
  latitude: 36.7477, // Replace with actual latitude value
  longitude: -119.7724, // Replace with actual longitude value
};
const demLocation2 = {
  id: 3,
  name: "Mbombela Home",
  addressline1: "Mataffin",
  addressline2: "Unit 10",
  town_city: "Mapleton",
  province: "NY",
  latitude: 42.3304, // Replace with actual latitude value
  longitude: -77.6239, // Replace with actual longitude value
};

destination_locations.push(demLocation);
destination_locations.push(demLocation1);
destination_locations.push(demLocation2);

console.log(destination_locations);

users.push(adminUser);
users.push(StudentUser);
users.push(StudentUser2);
users.push(inifiniTechUser)
users.push(DriverUser1);
users.push(DriverUser2);

cars.push(adminCar);
cars.push(userCar);
cars.push(userCar2);

var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};
app.use(
  session({
    secret: `${generateSecretKey()}`, // Replace with a secret key of your choice
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", indexRouter);
app.use("/auth", authRouterRegister);
app.use("/auth", authRouterLogin);

function calculateDistance({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 }) {
  // Radius of the Earth in kilometers
  const earthRadius = 6371; // Approximate value, you can use a more accurate radius if needed

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  // Calculate the differences in latitude and longitude
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Calculate the distance using the Pythagorean theorem
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance; // Distance in kilometers
}

// LOCATIONS 

// Endpoint to handle location addition
app.post('/api/locations/add', (req, res) => {
  const newLocation = req.body;
  newLocation.latitude = 0;
  newLocation.longitude = 0;

 /*  
 from Frontend
  name: 'Matsulu B',
  addressLine1: 'Nelspruit',
  addressLine2: 'w0920390',
  townCity: 'oiowioeioioi',
  province: 'Mpumalanga ',
  latitude: 0,
  longitude: 0

To server 

 id: 3,
  name: "Mbombela Home",
  addressline1: "Mataffin",
  addressline2: "Unit 10",
  town_city: "Mapleton",
  province: "NY",
  latitude: 42.3304, // Replace with actual latitude value
  longitude: -77.6239, // Replace with actual longitude value
  */
  let id = destination_locations.length + 1;
  // Perform actions with the received data (e.g., save to a database)
  // For simplicity, we'll just log the data in this example
  console.log('Received new location data:', { id,...newLocation});
  destination_locations.push({ ...newLocation , id})
  res.json({ status: 'success', message: 'Location added successfully' });
});
// END LOCATIONS

// START OF RIDE REQUESTS
app.get("/api/ride-request/accept/:req_id", (req, res) => {
  const User = req.session.user
  if (User) {
    const rideRequest = rideRequests.find(
      (ride) => parseInt(ride.id) === parseInt(req.params.req_id)
    );
    rideRequest.status = rideStatus.accepted;

    /*                        <td data-label="pickupLocation"><%= UserRideRequests[i].pickupLocation %></td>
                        <td data-label="destination">
                          <%= UserRideRequests[i].destination.name %>, 
                          <%= UserRideRequests[i].destination.addressline1 %>, 
                          <%= UserRideRequests[i].destination.addressline2 %>
                        </td>*/

    SendEmail(User.email, "Ride request accepted", `Dear ${User.name} ${User.surname}, Your Ride request has been accepted please be ready for Pick Up at ${rideRequest.pickupLocation} your destination is set to ${rideRequest.destination.name}`)
    return res.redirect("/home");
  } else {
    return res.redirect("/auth/login");
  }
});
app.get("/forgot-password", (req, res) => res.render("forgot-password.ejs"));
app.post("/reset-password", (req, res) => {
  const email = req.body.email;
  const foundUser = findUserByEmail(email);
  if (foundUser) {
    const message = `Password reset requested for ${email}. Please check your inbox.`;
    const mailOptions = {
      from: "botauto212@gmail.com",
      to: email,
      subject: "Password Recovery",
      text:
        `Password reset requested for ${email}. ` +
        `Password: ${foundUser.password}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
      return res.render( 'forgot-password-message', { message: { isError: false, msg : message } } );
    });
  } else {
    const error = `User with email ${email} not found.`
    return res.render( 'forgot-password-message', { message: {isError: true, msg : error } } );
  }
});


app.get("/app", (req, res) => res.render("page"));
app.get("/api/ride-request/opened/:req_id", (req, res) => {
  
  const User = req.session.user
  if (User) {
    const rideRequest = rideRequests.find(
      (ride) => parseInt(ride.id) === parseInt(req.params.req_id)
    );

    console.log("Opened New Ride Request", rideRequest)
    const Driver = users.find(user => user.drivercode === rideRequest.selectedDriverCode)
    console.log("For Driver", Driver)

    rideRequest.status = rideStatus.opened;
    SendEmail(User.email, "New Ride Request Confirmation", `Dear ${User.name} ${User.surname}, Your Ride request has been received please be ready for Pick Up at ${rideRequest.pickupLocation} your destination is set to ${rideRequest.destination.name}`)

    res.redirect("/home");
  } else {
    res.redirect("/auth/login");
  }
});

app.get("/api/ride-request/delete/:id", (req, res) => {
  console.log("I am on Delete for RideRequest");
  const id = parseInt(req.params.id);
  // Find the index of the car with the specified plate
  console.log("Ride ID:", id);

  const rideRequestIndex = rideRequests.findIndex((ride) => {
    console.log(ride.id, id);
    return ride.id === id;
  });

  if (rideRequestIndex !== -1) {
    // Car found, remove it from the array
    const deletedRide = rideRequests.splice(rideRequestIndex, 1)[0];
    console.log(deletedRide);
    res.json({ success: true, deletedRide });
  } else {
    // Car not found
    res.status(404).json({ success: false, message: "Ride Request Not found" });
  }
});

app.post("/api/ride-request", (req, res) => {
  const User = req.session.user;
  console.log("New Ride Request Incoming ", req.body);
  if (User.usertype === userTypes.student) {
    const { pickupLocation, destination_id } = req.body;
    let id = rideRequests.length + 1;
    let status = rideStatus.requested;
    const AvailableCarsToSelectedDestination = cars.filter(
      (car) => car.dest_id === parseInt(destination_id)
    );
    if (AvailableCarsToSelectedDestination.length > 0) {
      const lastCar =
        AvailableCarsToSelectedDestination[
          AvailableCarsToSelectedDestination.length - 1
        ];

      if (lastCar.seats) {
        lastCar.seats = lastCar.seats - 1;
        const destination = destination_locations.find(
          (dest) => dest.id === parseInt(destination_id)
        );
        const newRideRequest = {
          id,
          requester: User.id,
          selectedDriverCode: lastCar.drivercode,
          car: lastCar,
          requestDate: new Date(),
          pickupLocation,
          destination,
          status,
          requesterObject: User,
        };

        
        console.log("Opened New Ride Request", newRideRequest)
        const Driver = users.find(user => user.drivercode === newRideRequest.selectedDriverCode)
        console.log("For Driver", Driver)

        SendEmail(User.email, "New Ride Request Confirmation", `Dear ${User.name} ${User.surname}, Your Ride request has been received please be ready for Pick Up at ${newRideRequest.pickupLocation} your destination is set to ${newRideRequest.destination.name}`)
        
        
          SendEmail(Driver.email, "New Ride Request for You", `Dear ${Driver.name} ${Driver.surname}, You have received a Ride request from ${User.name} ${User.surname} @${User.email} Pick Up at ${newRideRequest.pickupLocation} User destination is set to ${newRideRequest.destination.name}, Login to your Portal to view`)
     
        console.log("Ride Request =>:", newRideRequest);
        rideRequests.push(newRideRequest);
      } else {
        console.error(
          "Seats property is undefined for the last available car."
        );
      }
    } else {
      console.error("No available cars for the selected destination.");
    }
  }

  res.redirect("/home");
});
app.get("/ride-requests", (req, res) => {
  let UserRideRequests = [];
  UserRideRequests = rideRequests;
  if (req.session.user) {
    let user = req.session.user;
    if (user.usertype === userTypes.student) {
      UserRideRequests = rideRequests.filter(
        (ride) => parseInt(ride.requester) === user.id
      );
    }
    if (user.usertype === userTypes.driver) {
      console.log("On dRIVER", UserRideRequests);
      UserRideRequests = rideRequests.filter(
        (ride) => ride.selectedDriverCode === user.drivercode
      );
      console.log("On dRIVER", UserRideRequests);
    }

    numberOfRideRequestToday = UserRideRequests.slice(-4).filter((rideReq) => {
      const dateMatch =
        GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate);
      return dateMatch;
    }).length;

    return res.render("ride-request", {
      user: user,
      UserRideRequests: UserRideRequests,
      numberOfRideRequestToday,
    });
  } else {
    console.log("You are not logged in");
    res.redirect("/auth/login"); // Redirect
  }
});
// END OF RIDE REQUESTS

app.post("/api/users/account/disable", (req, res) => {
  const { userId , reason } = req.body
  const foundUser = users.find(user => user.id === parseInt(userId));
  const userIndex = users.findIndex(user => user.id === parseInt(userId));
  
  // If the user with the specified ID is found
  if (userIndex !== -1) {
    // Update the age property of the user
    users[userIndex].disabled = true;
    console.log(`User with ID ${userId} updated.`);
  } else {
    console.log(`User with ID ${userId} not found.`);
  }

  const emailMsg = `Dear ${foundUser.name} ${foundUser.surname},  Your account has been Disabled Contact Admin @TheInfiniteTech23@gmail.com , Reason: ` + reason; 

  if (foundUser) {
    const mailOptions = {
      from: "botauto212@gmail.com",
      to: foundUser.email,
      subject: "Account Disabled",
      text:
      emailMsg
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
  
  res.redirect("/home");
});
app.post("/api/users/account/enable", (req, res) => {
  const { userId , reason } = req.body
  const foundUser = users.find(user => user.id === parseInt(userId));
  const userIndex = users.findIndex(user => user.id === parseInt(userId));
  
  // If the user with the specified ID is found
  if (userIndex !== -1) {
    // Update the age property of the user
    users[userIndex].disabled = false;
    console.log(`User with ID ${userId} updated.`);
  } else {
    console.log(`User with ID ${userId} not found.`);
  }

  const emailMsg = `Dear ${foundUser.name} ${foundUser.surname}, Your account has been Enabled Again, Reason: ` + reason; 
  if (foundUser) {
    const mailOptions = {
      from: "botauto212@gmail.com",
      to: foundUser.email,
      subject: "Account Enabled Again",
      text:
      emailMsg
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
  
  res.redirect("/home");
});

function SendEmail(to, subject, message) {
  const mailOptions = {
    from: "botauto212@gmail.com",
    to: to,
    subject: subject,
    text:
    message
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.post("/api/register", (req, res) => {
  console.log(req.body);
  let id = users.length + 1;
  const { drivercode, name, surname, phone, usertype, email, password } =
    req.body;
  const newUser = {
    id,
    disabled : false,
    drivercode,
    name,
    surname,
    usertype,
    email,
    password,
    phone,
    lat: null,
    long: null,
  };
  users.push(newUser);
  res.redirect("/auth/login");
});

function findUserByEmailAndPassword(email, password) {
  return users.find(
    (user) => user.email === email && user.password === password
  );
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const foundUser = findUserByEmailAndPassword(email, password);

  if(!foundUser.disabled){

  if (foundUser) {
    // Store user information in the session
    req.session.user = foundUser;
    
    console.log("Session: ", req.session.user);
    res.redirect("/home"); // Redirect to the dashboard or any other authenticated page
  } else {
    res.render("login", { error: "Your Password or email appears to be incorrect" }); // Redirect back to the login page if login fails
  }
} else {
  res.render("login", { error: "Your Account was Disabled, Contact Admin @TheInfiniteTech23@gmail.com" }); 
}

}

);

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/update/password", (req, res) => {
  const User = req.session.user;
  console.log("Updating user Password ...: ", User);
  const { password} = req.body;
  console.log(req.body);
  // Assuming you have a user ID associated with the request (e.g., from a session)
  const userId = req.session.user.id;
  // Find the user by ID in the users array
  const user = users.find(u => u.id === userId);
  if (user) {
    // Update the user's profileUrl
    user.password = password;
    req.session.user.password = password;
    
  } else {
    console.log("User not found with ID:", userId);
  }

  
  
  console.log("Updating user Password ...: ", req.session.user);
  res.redirect("/profile");
});

app.post("/api/users/update", (req, res) => {
  const User = req.session.user;
  console.log("Updating user...");
  const { name, surname, email, phone } = req.body;

  console.log(req.body);
    // Assuming you have a user ID associated with the request (e.g., from a session)
  const userId = req.session.user.id;

  // Find the user by ID in the users array
  const user = users.find(u => u.id === userId);

  if (user) {
    // Update the user's profileUrl
    user.name = name;
    req.session.user.name = name;
    user.surname = surname;
    req.session.user.surname = surname;
    user.email = email;
    req.session.user.email = email;
    user.phone = phone;
    req.session.user.phone = phone;

  } else {
    console.log("User not found with ID:", userId);
  }

  res.redirect("/profile");
});

function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}
app.post("/coordinates", (req, res) => {
  const { latitude, longitude } = req.body;

  // You can now use the latitude and longitude values in your server logic
  // For example, you can save them to a database, process them, or respond with some data
  console.log(
    `Received coordinates: Latitude: ${latitude}, Longitude: ${longitude}`
  );
  driver = { lat: latitude, long: longitude };
  // Respond with a success message
  res.json({ message: "Coordinates received successfully" });
});
app.post("/coord", (req, res) => {
  const { latitude, longitude } = req.body;

  // You can now use the latitude and longitude values in your server logic
  // For example, you can save them to a database, process them, or respond with some data
  console.log(
    `Received coordinates: Latitude: ${latitude}, Longitude: ${longitude}`
  );
  req.user.lat = latitude;
  req.user.long = longitude;
  // Respond with a success message
  res.json({ message: "Coordinates received successfully" });
});

app.get("/logout", (req, res) => {
  if (req.session.user) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
    });
  }
  res.redirect("/auth/login"); // Redirect
});

app.get("/profile", (req, res) => {
  if (req.session.user) {
    if (req.session.user.usertype === userTypes.student) {
      const UserRideRequests = rideRequests.filter(
        (ride) => parseInt(ride.requester) === req.session.user.id
      );
      let numberOfRideRequestToday = 0;
      let userCars = cars.filter(
        (car) => car.drivercode == req.session.user.drivercode
      );
      if (UserRideRequests) {
        const currentDate = new Date();
        numberOfRideRequestToday = UserRideRequests.slice(-4).filter(
          (rideReq) => {
            const dateMatch =
              GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate);
            return dateMatch;
          }
        ).length;

        return res.render("profile", {
          user: req.session.user,
          userCars: userCars,
          LastRideRequest: UserRideRequests[UserRideRequests.length - 1],
          UserRideRequests: UserRideRequests.slice(0, 5),
          destination_locations,
          numberOfRideRequestToday,
        });
      }
    }
    if (req.session.user.usertype === userTypes.driver) {
      const UserRideRequests = rideRequests.filter(
        (ride) => parseInt(ride.requester) === req.session.user.id
      );
      let numberOfRideRequestToday = 0;
      let userCars = cars.filter(
        (car) => car.drivercode == req.session.user.drivercode
      );
      if (UserRideRequests) {
        const currentDate = new Date();
        numberOfRideRequestToday = UserRideRequests.slice(-4).filter(
          (rideReq) => {
            const dateMatch =
              GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate);
            return dateMatch;
          }
        ).length;

        return res.render("profile", {
          user: req.session.user,
          userCars: userCars,
          LastRideRequest: UserRideRequests[UserRideRequests.length - 1],
          UserRideRequests: UserRideRequests.slice(0, 5),
          destination_locations,
          numberOfRideRequestToday,
        });
      }
    }
    // let userCars = cars.filter(car => car.drivercode == req.session.user.drivercode)
    // console.log("User cars",userCars);
    // res.render('profile', {
    //   user : req.session.user,
    //   userCars: userCars
    //   UserRideRequests
    // })
  } else {
    console.log("You are not logged in");
    res.redirect("/auth/login"); // Redirect
  }
});

function GetDateMatch(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function GetCurrentDateMatch() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

app.get("/home", (req, res) => {
  console.log(cars);
  if (req.session.user) {
    console.log(
      "You are logged in => ",
      req.session.user.usertype === userTypes.admin
    );
    if (req.session.user.usertype === userTypes.student) {
      const UserRideRequests = rideRequests.filter(
        (ride) => parseInt(ride.requester) === req.session.user.id
      );
      let numberOfRideRequestToday = 0;
      if (UserRideRequests) {
        const currentDate = new Date();
        numberOfRideRequestToday = UserRideRequests.slice(-4).filter(
          (rideReq) => {
            const dateMatch =
              GetCurrentDateMatch() === GetDateMatch(rideReq.requestDate);
            return dateMatch;
          }
        ).length;

        console.log("SJDHJHDSJ", UserRideRequests);
        return res.render("home", {
          user: req.session.user,
          cars: cars,
          LastRideRequest: UserRideRequests[UserRideRequests.length - 1],
          UserRideRequests: UserRideRequests.slice(0, 5),
          destination_locations,
          numberOfRideRequestToday,
        });
      }
    }

    if (req.session.user.usertype === userTypes.driver) {
      console.log("In Driver =>", req.session.user);
      console.log(rideRequests);
      const UserRideRequests = rideRequests.filter((ride) => {
        console.log(req.session.user.drivercode, ride.selectedDriverCode);
        return req.session.user.drivercode === ride.selectedDriverCode;
      });

      const numberOfRideRequestToday = UserRideRequests.length;
      return res.render("home-driver", {
        user: req.session.user,
        cars: cars,
        LastRideRequest: UserRideRequests[UserRideRequests - 1],
        UserRideRequests: UserRideRequests,
        numberOfRideRequestToday,
      });
    } else if (req.session.user.usertype === userTypes.admin) {
      console.log("In Admin =>", req.session.user);
      console.log(rideRequests);
      const UserRideRequests = rideRequests.filter((ride) => {
        console.log(req.session.user.drivercode, ride.selectedDriverCode);
        return req.session.user.drivercode === ride.selectedDriverCode;
      });
      const numberOfRideRequestToday = UserRideRequests.length;
      for (let car of cars) {
        for (let user of users) {
          if (user.drivercode === car.drivercode) {
            user.car = car;
            car.user = user;
            console.log(car);
          }
        }
      }

      const adminUsers = users.filter((user) => user.id !== req.session.user.id)

      return res.render("home-admin", {
        user: req.session.user,
        cars: cars,
        users: adminUsers,
        LastRideRequest: UserRideRequests[UserRideRequests - 1],
        UserRideRequests: UserRideRequests,
        numberOfRideRequestToday,
      });
    } else {
      return res.render("home", {
        user: req.session.user,
        cars: cars,
      });
    }
  } else {
    console.log("You are not logged in");
    res.redirect("/auth/login"); // Redirect
  }
});

app.get("/cars", (req, res) => {
  const User = req.session.user;
  if (User) {
    console.log(User);
    if (User.usertype === userTypes.driver) {
      const carsForDriver = cars.filter(
        (car) => car.drivercode === User.drivercode
      );
      console.log("On Driver With: " + carsForDriver);
      res.render("cars", {
        user: req.session.user,
        cars: carsForDriver,
        destination_locations,
        numberOfRideRequestToday: 0,
      });
    }
    if (User.usertype === userTypes.admin) {
      res.render("cars", {
        user: req.session.user,
        cars: cars,
        numberOfRideRequestToday: 0,
      });
    }
  } else {
    console.log("You are not logged in");
    res.redirect("/auth/login"); // Redirect
  }
});
app.get("/api/cars", (req, res) => {
  res.send(cars);
});

app.post("/api/user/profile/image", upload_profile_pic.single('newProfileImage'), (req, res) => {
  console.log("Receiving profile image..");

  // Assuming you have a user ID associated with the request (e.g., from a session)
  const userId = req.session.user.id;
  
  // Find the user by ID in the users array
  const user = users.find(u => u.id === userId);
  console.log(user);

  if (user) {
    // Update the user's profileUrl
    user.profileUrl = '/images/profiles/' + req.file.filename;
    req.session.user.profileUrl = user.profileUrl;
    console.log("Updated profile image for user ID:", userId);
    console.log("New profile image URL:", user.profileUrl);
  } else {
    console.log("User not found with ID:", userId);
  }

  res.redirect('/profile');
});

app.post("/api/cars", upload_car.single('carImage'), (req, res) => {
  const User = req.session.user;
  console.log("User Adding car: ", User);
  console.log("Adding a car... : ", req.body);
  const { name, plate, seats,destination_id, condition } = req.body;
  const destination = destination_locations.find(
    (loc) => loc.id === parseInt(destination_id)
  );
  let id = cars.length + 1;

  const imageUrl = '/images/vehicles/' + req.file.filename;

  console.log(imageUrl);
  const newCar = {
    id,
    name,
    seats : parseInt(seats),
    plate,
    imageUrl:imageUrl,
    status: vehicleAvailStat.available,
    condition,
    dest_id : parseInt(destination_id),
    drivercode: User.drivercode,
    destination,
  };

  /*
  id: 1,
  name: "Mercedes Sprinter",
  condition: "Good",
  dest_id: 2,
  status: "booked",
  drivercode: "USER100",
  plate: "GDB 203 MP",
  seats: 15,
  imageUrl: "images/vehicle1.jpg",
  
  id: 4,
  name: 'The Kilter',
  plate: 'TXM20989',
  imageUrl: '/images/vehicle1.jpg',
  status: 'Available',
  condition: 'Good',
  dest_id: 3,
  drivercode: 'USER200',
  destination: {
    id: 3,
    name: 'Mbombela Home',
    addressline1: 'Mataffin',
    addressline2: 'Unit 10',
    town_city: 'Mapleton',
    province: 'NY',
    latitude: 42.3304,
    longitude: -77.6239
  }
   */


  console.log(newCar);
  cars.push(newCar);

  res.redirect("/cars");
});
app.get("/users", (req, res) => {
  if (req.session.user) {
    res.render("users", {
      user: req.session.user,
      cars: cars,
      users: users,
    });
  } else {
    console.log("You are not logged in");
    res.redirect("/auth/login"); // Redirect
  }
});

// catch 404 and forward to error handler

// error handler

app.get("/distance", function (req, res) {
  let a = { lat: driver.lat, lon: driver.long };
  let b = { lat: req.user.lat, lon: req.user.long };
  return calculateDistance(a, b);
});

app.get("/api/cars/delete/:plate", (req, res) => {
  console.log("I am on Delete");
  const plate = req.params.plate;
  // Find the index of the car with the specified plate
  const carIndex = cars.findIndex((car) => {
    console.log(car.plate, plate);
    return car.plate === plate;
  });

  if (carIndex !== -1) {
    // Car found, remove it from the array
    const deletedCar = cars.splice(carIndex, 1)[0];
    console.log(deletedCar);
    res.json({ success: true, deletedCar });
  } else {
    // Car not found
    res.status(404).json({ success: false, message: "Car not found" });
  }
});
app.get("/api/cars/all", (req, res) => {
  // Find the index of the car with the specified plate
  if (cars.length > 0) {
    // Car found, remove it from the array
    res.json(cars);
  } else {
    // Car not found
    res.status(404).json({ success: false, message: "No Cars" });
  }
});




app.get("/api/users/delete/:name", (req, res) => {
  console.log("I am on Delete");
  const plate = req.params.plate;
  // Find the index of the car with the specified plate
  const carIndex = cars.findIndex((car) => {
    console.log(car.plate, plate);
    return car.plate === plate;
  });

  if (carIndex !== -1) {
    // Car found, remove it from the array
    const deletedCar = cars.splice(carIndex, 1)[0];
    console.log(deletedCar);
    res.json({ success: true, deletedCar });
  } else {
    // Car not found
    res.status(404).json({ success: false, message: "Car not found" });
  }
});

app.get("/api/users/:id", (req, res) => {
  const userIdToDelete = parseInt(req.params.id);
  // Find the index of the user with the specif
  const userIndex = users.findIndex((user) => user.id === userIdToDelete);

  if (userIndex !== -1) {
    // User found, remove it from the array
    const deletedUser = users.splice(userIndex, 1)[0];
    console.log(deletedUser);
    // res.json({ success: true, deletedUser });
    return res.redirect("/home");
  } else {
    // User not found
    res.status(404).json({ success: false, message: "User not found" });
  }
});

const port = process.env.PORT || 5000;

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
