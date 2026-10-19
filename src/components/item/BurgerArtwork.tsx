import Image from "next/image";

export default function BurgerArtwork({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="burger-artwork">
      <div className="burger-white-circle" />
      <Image className="burger-product-image" src={src} alt={alt} width={1000} height={918} priority sizes="(max-width: 600px) 92vw, 540px" />
    </div>
  );
}
