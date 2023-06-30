import {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  updateUserDescription,
  buyUserPremium,
  cancelUserPremium,
  setDonationLinks,
} from "../models/User.js";

const updateDescription = async (req, res) => {
  try {
    const { userId } = req.user;
    const { description } = req.body;

    await updateUserDescription(userId, description);

    return res
      .status(200)
      .json({
        message: "Descripción actualizada correctamente",
        status: "success",
        description: description,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Ocurrió un error al actualizar la descripción",
        status: "error",
      });
  }
};

const followUserController = async (req, res) => {
  const { followerId, followingId } = req.body;

  try {
    const { follower, following } = await followUser(followerId, followingId);

    res
      .status(200)
      .json({
        message: "Has comenzado a seguir a este usuario",
        status: "success",
      });
  } catch (error) {
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(200)
      .json({
        message: "Contrataste el plan premium exitosamente",
        status: "success",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Ocurrió un error al contratar el plan premium",
        status: "error",
      });
  }
};

const cancelPremium = async (req, res) => {
  try {
    const { userId } = req.user;

    await cancelUserPremium(userId);
    res
      .status(200)
      .json({
        message: "Cancelaste el plan premium exitosamente",
        status: "success",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Ocurrió un error al cancelar el plan premium",
        status: "error",
      });
  }
};

const setLinks = async (req, res) => {
  try {
    const {userId} = req.params.userId
    const {coffeeLink, paypalLink, mercadoPagoLink} = req.body

    await setDonationLinks(userId, {coffeeLink, paypalLink, mercadoPagoLink})
    res
      .status(200)
      .json({
        message: "Se actualizaron los enlaces",
        status: "success",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Ocurrió un error al actualizar los enlaces",
        status: "error",
      });
  }
}

export {
  updateDescription,
  followUserController,
  unfollowUserController,
  getFollowerUserIds,
  getFollowingUserIds,
  buyPremium,
  cancelPremium,
  setLinks,
};
