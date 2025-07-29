export function getImageUrl(image) {
  if (!image) return "/placeholder.svg?height=300&width=400";
  const backendUrl = import.meta.env.VITE_BASE_URL.replace('/api', '');
  return image.startsWith('http') ? image : `${backendUrl}/uploads/${image}`;
}
