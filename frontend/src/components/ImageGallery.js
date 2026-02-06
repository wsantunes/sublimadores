import { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageModal from './ImageModal';

export default function ImageGallery({ images, onDelete, userRole }) {
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Nenhuma imagem encontrada</h3>
        <p className="text-muted-foreground">Faça upload de imagens para começar</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="masonry">
        {images.map((image) => (
          <div key={image.image_id} className="masonry-item group relative" data-testid="image-card">
            <div className="bg-white border border-border rounded-sm overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="relative aspect-auto">
                <img
                  src={image.image_data}
                  alt={image.title}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    onClick={() => setSelectedImage(image)}
                    size="sm"
                    className="bg-white text-foreground hover:bg-primary hover:text-white rounded-sm"
                    data-testid="view-image-button"
                  >
                    <Eye size={16} />
                  </Button>
                  {userRole === 'admin' && onDelete && (
                    <Button
                      onClick={() => onDelete(image.image_id)}
                      size="sm"
                      variant="destructive"
                      className="rounded-sm"
                      data-testid="delete-image-button"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-foreground text-base mb-1">{image.title}</h3>
                {image.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{image.description}</p>
                )}
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}