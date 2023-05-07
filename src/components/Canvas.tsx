export default function Canvas({
  title,
  canvasRef,
}: {
  title: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  return (
    <div>
      <h2 className="text-center text-3xl font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300"
        width={300}
        height={300}
      />
    </div>
  );
}
