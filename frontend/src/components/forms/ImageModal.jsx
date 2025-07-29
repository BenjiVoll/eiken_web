const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative">
        <img src={imageUrl} alt="Vista completa" className="max-w-full max-h-[80vh] rounded shadow-lg" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200"
        >
          <span className="text-lg font-bold text-gray-700">×</span>
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
