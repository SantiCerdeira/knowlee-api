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

    res.status(200).json({ message: 'Se envió el email para el cambio de contraseña.' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
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
};
