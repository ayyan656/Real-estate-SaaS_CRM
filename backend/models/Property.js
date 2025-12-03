// import mongoose from "mongoose";

// const propertySchema = new mongoose.Schema(
//       images: [
//         {
//           url: {
//             type: String,
//             required: true,
//           },
//           publicId: String, // For Cloudinary deletion
//         },
//       ],
//   {
//     title: {
//       type: String,
//       required: [true, "Please provide a property title"],
//       trim: true,
//     },
//     description: String,
//     address: {
//       type: String,
//       required: [true, "Please provide an address"],
//     },
//     price: {
//       type: Number,
//       required: [true, "Please provide a price"],
//     },
//     beds: {
//       type: Number,
//       default: 0,
//     },
//     baths: {
//       type: Number,
//       default: 0,
//     },
//     sqft: {
//       type: Number,
//       default: 0,
//     },
//     type: {
//       type: String,
//       enum: ["House", "Apartment", "Commercial", "Land"],
//       default: "House",
//     },
//     status: {
//       type: String,
//       enum: ["Active", "Sold", "Draft"],
//       default: "Active",
//     },
//     agent: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     featured: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Property", propertySchema);
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String, // For Cloudinary deletion
      },
    ],

    title: {
      type: String,
      required: [true, "Please provide a property title"],
      trim: true,
    },
    description: String,
    address: {
      type: String,
      required: [true, "Please provide an address"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },
    beds: {
      type: Number,
      default: 0,
    },
    baths: {
      type: Number,
      default: 0,
    },
    sqft: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["House", "Apartment", "Commercial", "Land"],
      default: "House",
    },
    status: {
      type: String,
      enum: ["Active", "Sold", "Draft"],
      default: "Active",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
