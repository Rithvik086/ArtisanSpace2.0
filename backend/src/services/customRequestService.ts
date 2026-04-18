import Request from "../models/customRequestModel.js";

interface RequestListOptions {
  page?: number;
  limit?: number;
}

const buildPagination = (total: number, page: number, limit: number) => ({
  currentPage: page,
  totalPages: Math.ceil(total / limit),
  total,
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

const normalizePagination = (options?: RequestListOptions) => {
  const page = Math.max(1, Number(options?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options?.limit) || 25));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export async function addRequest(
  userId: string,
  title: string,
  type: string,
  image: string,
  description: string,
  budget: string,
  requiredBy: string
) {
  try {
    const request = new Request({
      userId,
      title,
      type,
      image,
      description,
      budget,
      requiredBy,
    });
    await request.save();
    return { success: true };
  } catch (error) {
    throw new Error("Error adding request: " + (error as Error).message);
  }
}

// export async function getRequestById(userId) {
//   try {
//     const request = await Request.find({ userId });
//     if (!request) {
//       throw new Error("Request not found!");
//     }

//     return request;
//   } catch (err) {
//     throw new Error("Error in getting request by ID: " + err.message);
//   }
// }

export async function getRequests(
  isAccepted: boolean | null = null,
  artisanId: string | null = null
) {
  try {
    const queryFilter: Record<string, unknown> = { isValid: true };

    if (artisanId) {
      queryFilter.artisanId = artisanId;
      queryFilter.isAccepted = true;
    } else if (isAccepted !== null) {
      queryFilter.isAccepted = isAccepted;
    }

    const request = await Request.find(queryFilter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return request;
  } catch (e) {
    throw new Error("Error in getting requests: " + (e as Error).message);
  }
}

export async function getAvailableRequests(options?: RequestListOptions) {
  try {
    const { page, limit, skip } = normalizePagination(options);
    const query = { isValid: true, isAccepted: false };

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Request.countDocuments(query),
    ]);

    return {
      requests,
      pagination: buildPagination(total, page, limit),
    };
  } catch (e) {
    throw new Error(
      "Error in getting available requests: " + (e as Error).message,
    );
  }
}

export async function getAcceptedRequestsForArtisan(
  artisanId: string,
  options?: RequestListOptions,
) {
  try {
    const { page, limit, skip } = normalizePagination(options);
    const query = {
      isValid: true,
      isAccepted: true,
      artisanId,
    };

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Request.countDocuments(query),
    ]);

    return {
      requests,
      pagination: buildPagination(total, page, limit),
    };
  } catch (e) {
    throw new Error(
      "Error in getting artisan accepted requests: " + (e as Error).message,
    );
  }
}

export async function getRequestsByUser(
  userId: string,
  options?: RequestListOptions,
) {
  try {
    const { page, limit, skip } = normalizePagination(options);
    const query = {
      isValid: true,
      userId,
    };

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Request.countDocuments(query),
    ]);

    return {
      requests,
      pagination: buildPagination(total, page, limit),
    };
  } catch (e) {
    throw new Error("Error in getting user requests: " + (e as Error).message);
  }
}

export async function approveRequest(requestId: string, artisanId: string) {
  try {
    const request = await Request.findOneAndUpdate(
      { _id: requestId, isValid: true },
      { artisanId, isAccepted: true },
      { new: true, runValidators: true }
    );

    if (!request) {
      throw new Error("Request not found!");
    }

    return { success: true, message: "Request approved successfully!" };
  } catch (error) {
    throw new Error(
      "Error in approving the request: " + (error as Error).message
    );
  }
}

export async function deleteRequest(requestId: string) {
  try {
    const request = await Request.findOneAndUpdate(
      { _id: requestId, isValid: true },
      { isValid: false },
      { new: true, runValidators: true }
    );
    if (!request) {
      throw new Error("Error request not found!");
    }
    return { success: true, message: "Request removed successfully!" };
  } catch (error) {
    throw new Error(
      "Error in deleting the request: " + (error as Error).message
    );
  }
}
