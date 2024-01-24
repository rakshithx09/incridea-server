import { AccommodationBookingStatus, Gender, Status } from "@prisma/client";
import checkIfAccommodationMember from "../../accommodationMembers/checkIfAccommodationMembers";
import { builder } from "../../builder";

builder.mutationField("addAccommodationRequest", (t) =>
  t.prismaField({
    type: "UserInHotel",
    args: {
      gender: t.arg({ type: "String", required: true }),
      hotelId: t.arg({ type: "Int", required: true }),
      checkIn: t.arg({ type: "String", required: true }),
      checkOut: t.arg({ type: "String", required: true }),
      ac: t.arg({ type: "Boolean", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      //create accommodation request
      const data = await ctx.prisma.userInHotel.create({
        data: {
          User: {
            connect: {
              id: user.id,
            },
          },
          Hotel: {
            connect: {
              id: args.hotelId,
            },
          },
          gender: args.gender as Gender,
          checkIn: new Date(args.checkIn),
          checkOut: new Date(args.checkOut),
          AC: args.ac,
        },
        ...query,
      });
      return data;
    },
  }),
);

builder.mutationField("updateStatus", (t) =>
  t.prismaField({
    type: "UserInHotel",
    args: {
      bookingId: t.arg({ type: "String", required: true }),
      status: t.arg({ type: "String", required: true }),
      room: t.arg({ type: "String", required: true }),
      hotelId: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const isAllowed = checkIfAccommodationMember(user.id);
      if (!isAllowed) throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.userInHotel.update({
        where: {
          id: Number(args.bookingId),
        },
        data: {
          status: args.status as AccommodationBookingStatus,
          room: args.room,
          Hotel: {
            connect: {
              id: Number(args.hotelId),
            },
          },
        },
        ...query,
      });
      return data;
    },
  }),
);
