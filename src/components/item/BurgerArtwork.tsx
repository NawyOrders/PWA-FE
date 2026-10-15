import Image from "next/image";

export default function BurgerArtwork() {
  return (
    <div className="burger-artwork">
      <div className="burger-white-circle" />
      <Image className="burger-product-image" src="/burger.png" alt="برجر لحم بلدي بالجبن والخضروات" width={1000} height={918} priority sizes="(max-width: 600px) 92vw, 540px" />
    </div>
  );
}
