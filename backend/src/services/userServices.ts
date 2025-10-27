import mongoose from "mongoose";
import User from "../models/userModel.js";

export async function userExists(userId: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }
    const user = await User.findOne({ _id: userId, isValid: true });
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw new Error("Error checking user existence: " + (e as Error).message);
  }
}

export async function addUser(
  username: string,
  name: string,
  email: string,
  hashpass: string,
  mobile_no: string,
  role: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
      isValid: true,
    }).session(session);

    if (existingUser) {
      throw new Error("Username or email already exists.");
    }

    const user = new User({
      username,
      name,
      email,
      password: hashpass,
      mobile_no,
      role,
    });
    await user.save({ session });
    await session.commitTransaction();
    return { success: true };
  } catch (e) {
    await session.abortTransaction();
    if ((e as any).code === 11000) {
      throw new Error("Username or email already exists.");
    }
    throw new Error("Error adding user: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function findUserByName(username: string) {
  try {
    const user = await User.findOne({ username: username, isValid: true });

    if (!user) {
      return null;
    }

    return user;
  } catch (e) {
    throw new Error("Error finding user by name: " + (e as Error).message);
  }
}

export async function findUserByEmail(email: string) {
  try {
    const user = await User.findOne({ email, isValid: true });

    if (!email) {
      return null;
    }
    return user;
  } catch (e) {
    throw new Error("Error finding user by email: " + (e as Error).message);
  }
}

export async function getUserById(userId: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    const user = await User.findOne({ _id: userId, isValid: true });

    return user;
  } catch (e) {
    throw new Error("Error finding user by ID: " + (e as Error).message);
  }
}

export async function getUsers() {
  try {
    return await User.find({ isValid: true });
  } catch (e) {
    throw new Error("Error getting users: " + (e as Error).message);
  }
}

export async function getUsersByRole(role: string) {
  try {
    if (role === "manager") {
      return await User.find({
        $or: [{ role: "customer" }, { role: "artisan" }],
        isValid: true,
      });
    } else if (role === "admin") {
      return await User.find({ isValid: true });
    }
  } catch (e) {
    throw new Error(
      "Error failed to get users by role: " + (e as Error).message
    );
  }
}

export async function removeUser(userId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ _id: userId, isValid: true }).session(
      session
    );
    if (!user) {
      throw new Error("User not found.");
    }

    if (user) {
      await User.findOneAndUpdate(
        { _id: userId, isValid: true },
        { isValid: false },
        { new: true, session }
      );
      await session.commitTransaction();
      return { success: true };
    } else {
      throw new Error("User not found.");
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error removing user: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function updateUser(
  userId: string,
  name?: string,
  mobile_no?: string,
  address?: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID.");
    }
    const updateFields: Record<string, any> = {};
    if (name !== undefined) updateFields.name = name;
    if (mobile_no !== undefined) updateFields.mobile_no = mobile_no;
    if (address !== undefined) updateFields.address = address;

    console.log(updateFields);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isValid: true },
      updateFields,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedUser) {
      throw new Error("User not found.");
    } else {
      await session.commitTransaction();
      return { success: true, data: updatedUser };
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error updating user: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}

export async function updateUserPassword(userId: string, password: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID.");
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isValid: true },
      { password: password },
      { new: true, runValidators: true, session }
    );

    if (!updatedUser) {
      throw new Error("User not found.");
    } else {
      await session.commitTransaction();
      return true;
    }
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Error updating user password: " + (e as Error).message);
  } finally {
    session.endSession();
  }
}
