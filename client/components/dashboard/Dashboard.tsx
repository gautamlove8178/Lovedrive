import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import StorageCard from "./StorageCard";
import UploadZone from "@/components/upload/UploadZone";
import FileList from "../files/FileList";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen bg-[#080B14] text-white">
      <Sidebar />

      <section className="flex-1">
        <Navbar />

        <div className="space-y-8 p-8">
          <div>
            <h2 className="text-4xl font-bold">
              Welcome Back 👋
            </h2>

            <p className="mt-2 text-zinc-400">
              Your private cloud is ready.
            </p>
          </div>

          <StorageCard />
          <UploadZone />
          <FileList />
        </div>
      </section>
    </main>
  );
}