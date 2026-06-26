import { z } from "zod";


// ? validaciones de los campos de libro
export const bookSchema = z.object({
  title: z
    .string({ message: "el titulo no puede ser un numero " })
    .min(1, { message: "El título es obligatorio" })
    .max(100, { message: "un titulo solo puede tener 100 caracteres" }),

  summary: z.string({ message: "la descripción no puede ser un numero" }).min(1, { message: "La descripción es obligatoria" }).max(2500, {
    message: "el limite de caracteres que puede tener una descripción es de 4000 caracteres",
  }),

  language: z
    .string()
    .min(1, { message: "El idioma es obligatorio" })
    .max(3, {
      message: `
    debe ingresar las siglas del idioma, 
    Ejemplo:
    'es': español,
    'en': ingles`,
    }),

  genre: z
    .string({ message: "el genero no puede ser un numero" })
    .min(1, { message: "El género es obligatorio" })
    .max(50, { message: "un genero solo puede tener 50 caracteres como máximo" }),

  level: z
    .string({ message: "el nivel no puede ser un numero" })
    .min(1, { message: "El nivel es obligatorio" })
    .max(50, { message: "un nivel solo puede tener 50 caracteres como máximo" }),

  format: z
    .string({ message: "el formato no puede ser un numero" })
    .min(1, { message: "El formato es obligatorio" })
    .max(20, { message: "un formato solo puede tener 20 caracteres como máximo" }),
});
