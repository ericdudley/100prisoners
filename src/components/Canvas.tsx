export default function Canvas({
  title,
  canvasRef,
  textRef,
}: {
  title: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  textRef?: React.RefObject<HTMLParagraphElement>;
}) {
  return (
    <div>
      <h2 className="text-center text-3xl font-semibold text-gray-900 mb-1">
        {title}
      </h2>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300"
        width={300}
        height={300}
      />
      <p ref={textRef} className="whitespace-break-spaces max-w-[300px] text-gray-700"></p>
    </div>
  );
}
