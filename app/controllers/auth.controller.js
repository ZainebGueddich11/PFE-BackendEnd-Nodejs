const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
//const { user } = require("../models");
const Op = db.Sequelize.Op;
const { user } = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    pays: req.body.pays,
    ville: req.body.ville
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      }/*else {
        res.send({ message: "role!" });
      } */else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
          pays: user.pays,
          ville: user.ville
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });

};
exports.getUsername = (req, res) =>{
  user.findAll( 
     { attributes: ["username"],
   
  }
   ).then(user => res.send(user));
  };


/*
  exports.authone= (req, res) => {

    User.findOne({
            where: {
                username: req.body.username
            }
        })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }




            var token = jwt.sign({ id: user.id }, "zaineb", {
                expiresIn: 86400 // 24 hours
            });

            res.status(200).send({ token: token })

        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });

}

*/

exports.getauth= (req, res) => {

    User.findAll().then(data => {

        return res.status(200).send(data)
    }).catch(err => {

        return res.status(500).send(err)
    })


}
