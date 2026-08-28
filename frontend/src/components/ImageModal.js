import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageModal({ image, onClose }) {
  const handleDownload = () => {
    const mimeType = image.image_data.match(/^data:([^;]+);/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    const fileName = image.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 _-]/gi, '').trim() || 'imagem';
    const link = document.createElement('a');
    link.href = image.image_data;
    link.download = `${fileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="image-modal"
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white text-foreground hover:bg-primary hover:text-white rounded-sm"
          data-testid="close-modal-button"
        >
          <X size={20} />
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-sm p-6 max-h-full overflow-auto">
          <div className="flex-1 flex items-center justify-center">
            <img
              src={image.image_data}
              alt={image.title}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
          
          <div className="w-full md:w-80 space-y-4">
            <h2 className="text-2xl font-heading font-bold text-foreground">{image.title}</h2>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full rounded-sm"
              data-testid="download-image-button"
            >
              <Download size={18} />
              Baixar imagem original
            </Button>
            {image.description && (
              <p className="text-base text-muted-foreground leading-relaxed">{image.description}</p>
            )}
            {image.tags && image.tags.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}