import { MapPin, ExternalLink } from 'lucide-react';

interface MapWrapperProps {
  className?: string;
}

const MapWrapper: React.FC<MapWrapperProps> = ({ className = '' }) => {
  const address = 'C Close, 21 Road 2nd Ave, Festac Town, Lagos, Nigeria';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={`relative ${className}`}>
      {/* Embedded Google Maps iframe */}
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.2!2d3.2852!3d6.4698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjgnMTEuMyJOIDPCsDE3JzA2LjciRQ!5e0!3m2!1sen!2sng!4v1234567890`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
        title="Divasity Office Location"
      />
      
      {/* Overlay with address and link */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">Divasity Office</h4>
            <p className="text-gray-600 text-xs mt-1">{address}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-xs mt-2 font-medium"
            >
              <span>View in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapWrapper;