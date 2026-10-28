import z from 'zod'
export const UserLoginScema = z.object({
      email: z.string().email(),
      password: z.string()
    })