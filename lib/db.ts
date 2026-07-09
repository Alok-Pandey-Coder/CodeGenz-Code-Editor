//Importing PrismaClient in order to create a singleton instance of the PrismaClient to be used throughout the application. This ensures that we don't create multiple instances of the PrismaClient, which can lead to performance issues and connection limits being reached.
import { PrismaClient } from "@prisma/client"

//gloabalThis is a workaround for Next.js hot reloading issue. When using Next.js, the server can be restarted multiple times during development, which can lead to multiple instances of the PrismaClient being created. This can cause issues with database connections and performance. By using a global variable to store the PrismaClient instance, we can ensure that only one instance is created and used throughout the application, even during hot reloading.
const globalForPrisma = globalThis as unknown as {prisma: PrismaClient}

//Creating a singleton instance of the PrismaClient. If an instance already exists in the global variable, we use that instance. Otherwise, we create a new instance of the PrismaClient.
export const db = globalForPrisma.prisma || new PrismaClient()

//If the environment is not production, we assign the PrismaClient instance to the global variable. This allows us to reuse the same instance during development, even if the server is restarted multiple times.
if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = db