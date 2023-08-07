import {
  createUser,
  checkIfUserExists,
  findUserByEmail,
  findUserByEmailAndPassword,
  findUserById,
  checkIfUserExistsByUsername,
  getUsers,
  generateResetToken,
  setResetToken,
  changeUserPassword,
  getUserByResetToken,
} from "../models/User.js";
import { sendResetEmail } from "../services/sendResetEmail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const register = async (req, res) => {
  try {
    const { name, lastName, userName, date, email, password } = req.body;

    const userExists = await checkIfUserExists(email);
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con ese correo electrónico" });
    }

    const userExistsUsername = await checkIfUserExistsByUsername(userName);
    if (userExistsUsername) {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con ese nombre de usuario" });
    }

    await createUser({ name, lastName, userName, date, email, password });
    res.status(201).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario" });
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Por favor, ingrese todos los campos" });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res
        .status(400)
        .json({ message: "No existe un usuario con ese correo electrónico" });
    }

    const result = await findUserByEmailAndPassword(email, password);
    if (!result) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ userId: result._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log(token)

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
    console.log(error);
  }
};

const isAuthenticated = async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    return res.json({ authenticated: true });
  } catch (error) {
    console.log(error);
    return res.json({ authenticated: false });
  }
};

const getUserId = async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
  return res.json({ userId: decodedToken.userId });
};

const getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "No existe un usuario con ese id" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
    console.log(error);
  }
};

const getAuthenticatedUserById = async (req, res) => {
  try {
    const id = req.user.userId;
    const user = await findUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "No existe un usuario con ese id" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el usuario autenticado" });
    console.log(error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios" });
    console.log(error);
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const email = req.params.email;

    const resetToken = generateResetToken();

    await setResetToken(email, resetToken);

    await sendResetEmail(email, resetToken);

    res
      .status(200)
      .json({ message: "Se envió el email para el cambio de contraseña." });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo." });
  }
};

const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await getUserByResetToken(token);

    if (!user) {
      return res
        .status(400)
        .json({ message: "No existe un usuario con ese correo electrónico." });
    }

    if (user.resetToken !== token) {
      return res.status(400).json({ message: "El token es inválido." });
    }

    await changeUserPassword(user._id, password);

    res.status(200).json({ message: "Se cambió la contraseña con éxito." });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({ error: "Error al cambiar la contraseña." });
  }
};

const logout = async (req, res) => {
  try {
    console.log('Start logging out'); // Add a log at the beginning

    res.clearCookie('token');

    console.log('Cookie cleared'); // Add a log after clearing the cookie

    await new Promise((resolve) => res.on('close', resolve));

    console.log('Response sent'); // Add a log after the response is sent

    res.status(200).json({ message: "Sesión cerrada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar la sesión" });
    console.log(error);
  }
};


export {
  isAuthenticated,
  register,
  login,
  getUserId,
  getUserById,
  getAuthenticatedUserById,
  getAllUsers,
  requestPasswordReset,
  changePassword,
  logout
};
