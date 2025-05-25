export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Loading store locations...</h2>
        <p className="text-muted-foreground">Please wait while we find stores near you.</p>
      </div>
    </div>
  )
}
