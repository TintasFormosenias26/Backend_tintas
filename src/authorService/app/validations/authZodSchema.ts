import { z } from "zod";

const authorNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ.\s]+$/;

const birthdateSchema = z.union([
  z
    .string()
    .min(1, { message: "La fecha de nacimiento es obligatoria." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "La fecha debe tener el formato YYYY-MM-DD.",
    })
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "La fecha no es valida.",
    })
    .refine((value) => new Date(value) <= new Date(), {
      message: "La fecha de nacimiento no puede ser futura.",
    }),
  z.date().refine((value) => value <= new Date(), {
    message: "La fecha de nacimiento no puede ser futura.",
  }),
]);

export const AuthorZodSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "El nombre completo debe tener al menos 2 caracteres." })
    .max(100, { message: "El nombre completo no puede exceder 100 caracteres." })
    .regex(authorNameRegex, { message: "El nombre solo puede contener letras, puntos y espacios." }),

  biography: z
    .string()
    .min(10, { message: "La biografia debe tener al menos 10 caracteres." })
    .max(2000, { message: "La biografia no puede exceder 2000 caracteres." }),

  profession: z
    .string()
    .min(2, { message: "La profesion debe tener al menos 2 caracteres." })
    .max(100, { message: "La profesion no puede exceder 100 caracteres." }),

  birthdate: birthdateSchema,

  birthplace: z
    .string()
    .min(2, { message: "El lugar debe tener al menos 2 caracteres." })
    .max(100, { message: "El lugar no puede exceder 100 caracteres." }),

  nationality: z
    .string()
    .min(2, { message: "La nacionalidad debe tener al menos 2 caracteres." })
    .max(50, { message: "La nacionalidad no puede exceder 50 caracteres." }),
});

export const updataAuthorsZodSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "El nombre completo debe tener al menos 2 caracteres." })
    .max(100, { message: "El nombre completo no puede exceder 100 caracteres." })
    .regex(authorNameRegex, { message: "El nombre solo puede contener letras, puntos y espacios." })
    .optional(),

  biography: z
    .string()
    .min(10, { message: "La biografia debe tener al menos 10 caracteres." })
    .max(2000, { message: "La biografia no puede exceder 2000 caracteres." })
    .optional(),

  profession: z
    .string()
    .min(2, { message: "La profesion debe tener al menos 2 caracteres." })
    .max(100, { message: "La profesion no puede exceder 100 caracteres." })
    .optional(),

  birthdate: birthdateSchema.optional(),

  birthplace: z
    .string()
    .min(2, { message: "El lugar debe tener al menos 2 caracteres." })
    .max(100, { message: "El lugar no puede exceder 100 caracteres." })
    .optional(),

  nationality: z
    .string()
    .min(2, { message: "La nacionalidad debe tener al menos 2 caracteres." })
    .max(50, { message: "La nacionalidad no puede exceder 50 caracteres." })
    .optional(),
});
