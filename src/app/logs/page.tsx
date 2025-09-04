import Main from "@/components/logs/main";
import { Suspense } from "react";
import Loading from "@/components/shared/loading";

export default function Logs() {
  return (
    <div>
      <div className="flex flex-col gap-2 w-screen lg:w-[73vw] mx-auto">
        <Suspense fallback={<Loading />}>
          <Main />
        </Suspense>
      </div>
    </div>
  );
}
