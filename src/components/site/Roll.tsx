/** Text that rolls up on hover of the parent .btn / a */
export default function Roll({ children }: { children: string }) {
  return (
    <span className="roll" aria-hidden={false}>
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
