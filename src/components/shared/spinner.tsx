import "@/components/loading.css";

export default function Loader() {
  return (
    <div className="flex flex-row items-center justify-center h-screen w-screen">
      <div className="ui-abstergo">
        <div className="abstergo-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="ui-text">
          Bothering Academia
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
        </div>
      </div>
    </div>
  );
}
