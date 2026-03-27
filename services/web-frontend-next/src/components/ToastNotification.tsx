export default function ToastNotification({
  message,
  type = "success",
  visible
}: {
  message: string;
  type?: "success" | "error";
  visible: boolean;
}) {
  return (
    <div 
      className={`fixed top-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl text-white font-bold tracking-wide shadow-2xl transition-transform duration-500 z-50 flex items-center gap-3 backdrop-blur-md border ${
        type === "success" 
          ? "bg-green-500/90 border-green-400/50 shadow-green-500/20" 
          : "bg-red-500/90 border-red-400/50 shadow-red-500/20"
      } ${visible ? "translate-y-0" : "-translate-y-32"}`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}
