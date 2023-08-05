import {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  updateUserDescription,
  buyUserPremium,
  buyUserPremiumOneYear,
  cancelUserPremium,
  setDonationLinks,
  savePostAsFavorite,
  removePostFromFavorites,
} from "../models/User.js";
import { redeemCode } from "../models/PromoCode.js";
import { newNotification } from "./notifications-controller.js";

const updateDescription = async (req, res) => {
  try {
    const { userId } = req.user;
    const { description } = req.body;

    await updateUserDescription(userId, description);

    return res.status(200).json({
      message: "Descripción actualizada correctamente",
      status: "success",
      description: description,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ocurrió un error al actualizar la descripción",
      status: "error",
    });
  }
};

const followUserController = async (req, res) => {
  const { followerId, followingId } = req.body;

  try {
    const { follower, following } = await followUser(followerId, followingId);

    if (follower._id !== following._id) {
      await newNotification({
        sender: follower._id,
        receiver: following._id,
        type: "follow",
      });
    }

    res.status(200).json({
      message: "Has comenzado a seguir a este usuario",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al seguir al usuario",
      status: "error",
    });
    console.log(error);
  }
};

const unfollowUserController = async (req, res) => {
  const { followerId, followingId } = req.body;

  try {
    const { follower, following } = await unfollowUser(followerId, followingId);

    res
      .status(200)
      .json({ message: "Dejaste de seguir a este usuario", status: "success" });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al dejar de seguir al usuario",
      status: "error",
    });
    console.log(error);
  }
};

const getFollowerUserIds = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await getUserFollowers(userId);

    res.status(200).json(followers);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener los seguidores" });
    console.log(error);
  }
};

const getFollowingUserIds = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await getUserFollowing(userId);

    res.status(200).json(following);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al obtener los seguidos" });
    console.log(error);
  }
};

const buyPremium = async (req, res) => {
  try {
    const { userId } = req.user;

    await buyUserPremium(userId);
    res.status(200).json({
      message: "Contrataste el plan premium exitosamente",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al contratar el plan premium",
      status: "error",
    });
  }
};

const redeemCodeForOneYear = async (req, res) => {
  try {
    const { userId } = req.user;
    let { code } = req.body;

    code = code.toUpperCase();

    const promoCode = await redeemCode(code);
    if (!promoCode) {
      return res
        .status(400)
        .json({
          message: "El código ingresado no es válido o ya fue canjeado",
          status: "error",
        });
    }

    await buyUserPremiumOneYear(userId);
    res.status(200).json({
      message: "Código canjeado exitosamente",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al canjear el código",
      status: "error",
    });
  }
};

const cancelPremium = async (req, res) => {
  try {
    const { userId } = req.user;

    await cancelUserPremium(userId);
    res.status(200).json({
      message: "Cancelaste el plan premium exitosamente",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al cancelar el plan premium",
      status: "error",
    });
  }
};

const setLinks = async (req, res) => {
  try {
    const { userId } = req.params;
    let { coffeeLink, paypalLink, mercadoPagoLink } = req.body;

    coffeeLink = coffeeLink || null;
    paypalLink = paypalLink || null;
    mercadoPagoLink = mercadoPagoLink || null;

    const coffeeLinkRegex =
      /^https?:\/\/cafecito\.app\/[a-zA-Z0-9-_]+\/donate$/;
    const paypalLinkRegex =
      /^https?:\/\/(?:www\.)?paypal\.com\/donate\?hosted_button_id=[a-zA-Z0-9]+$/;
    const mercadoPagoLinkRegex =
      /^https?:\/\/(?:www\.)?mercadopago\.com\.ar\/checkout\/v1\/redirect\?pref_id=[a-zA-Z0-9]+$/;

    if (coffeeLink && !coffeeLinkRegex.test(coffeeLink)) {
      return res
        .status(400)
        .json({
          message: "El link de Cafecito ingresado no es válido",
          status: "error",
        });
    }
    if (paypalLink && !paypalLinkRegex.test(paypalLink)) {
      return res
        .status(400)
        .json({
          message: "El link de Paypal ingresado no es válido",
          status: "error",
        });
    }
    if (mercadoPagoLink && !mercadoPagoLinkRegex.test(mercadoPagoLink)) {
      return res
        .status(400)
        .json({
          message: "El link de MercadoPago no es válido",
          status: "error",
        });
    }

    await setDonationLinks(userId, { coffeeLink, paypalLink, mercadoPagoLink });

    res.status(200).json({
      message: "Se actualizaron los enlaces",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al actualizar los enlaces",
      status: "error",
    });
  }
};

const saveAsFavorite = async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId } = req.params;

    await savePostAsFavorite(userId, postId);

    res.status(200).json({
      message: "Se guardó la publicación",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Ocurrió un error al guardar la publicación",
      status: "error",
    });
  }
};

const removeFromFavorite = async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId } = req.params;

    await removePostFromFavorites(userId, postId);

    res.status(200).json({
      message: "La publicación ya no está guardada",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Ocurrió un error al eliminar la publicación de elementos guardados",
      status: "error",
    });
  }
};

export {
  updateDescription,
  followUserController,
  unfollowUserController,
  getFollowerUserIds,
  getFollowingUserIds,
  buyPremium,
  redeemCodeForOneYear,
  cancelPremium,
  setLinks,
  saveAsFavorite,
  removeFromFavorite,
};
