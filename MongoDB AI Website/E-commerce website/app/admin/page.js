import { notFound } from "next/navigation";

// Anyone trying to access /admin will be thrown a 404 Not Found error
export default function AdminTrap() {
  notFound();
}
