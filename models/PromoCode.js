import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    minlength: 6,
  },
  exchanged: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const PromoCode = mongoose.model("promo-codes", promoCodeSchema);

const redeemCode = async (code) => {
  try {
    const codeToUpdate = await PromoCode.findOne({
      code: code,
      exchanged: false,
    });

    if (!codeToUpdate) {
      throw new Error("El código ingresado no es válido o ya fue canjeado");
    }

    const result = await PromoCode.findOneAndUpdate(
      { code: code },
      { exchanged: true },
      { new: true }
    );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export { redeemCode };
