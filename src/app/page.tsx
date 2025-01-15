import { SignedIn } from "@clerk/nextjs";
import Table from "./table";

export default function Home() {
  return (
    <SignedIn>
      <Table />
    </SignedIn>
  );
}
