import { SignedIn } from "@clerk/nextjs";
import ProductView from "./product-view";

export default function Home() {
  return (
    <SignedIn>
      <ProductView />
    </SignedIn>
  );
}
