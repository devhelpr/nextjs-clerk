import { SignedIn } from "@clerk/nextjs";
import ProductTable from "./table";

export default function Home() {
  return (
    <SignedIn>
      <ProductTable />
    </SignedIn>
  );
}
