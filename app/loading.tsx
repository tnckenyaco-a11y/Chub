import { LoadingOwl } from "@/components/loading-owl";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingOwl size={72} />
    </div>
  );
}
