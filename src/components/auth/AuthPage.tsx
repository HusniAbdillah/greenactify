import React, { ReactNode } from "react";
import Image from "next/image";

type AuthPageWithImageProps = {
  imageUrl: string;
  children: ReactNode;
};

export default function AuthPageWithImage({
  imageUrl,
  children,
}: AuthPageWithImageProps) {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute inset-0 block lg:hidden z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(210, 232, 187, 0.60), transparent)",
            // background: 'linear-gradient(180deg, rgba(210, 232, 187, 0.70) 0%, rgba(210, 232, 187, 0.50) 30%, rgba(210, 232, 187, 0.20) 60%, rgba(210, 232, 187, 0) 100%)',
            //background:"linear-gradient(180deg, rgba(210, 232, 187, 0.80) 0%, rgba(20, 21, 19, 0.6) 25%, rgba(27, 28, 26, 0.2) 10%, transparent 95%)",
            zIndex: 1,
          }}
        />
      </div>

      <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(210, 232, 187, 0.60), transparent)",
            zIndex: 1,
          }}
        />

        <div className="relative z-50 h-1/4 flex items-center justify-start pl-35">
          <div className="flex items-center space-x-4">
            <div className="h-100 w-100">
              {" "}
              <Image
                src="/logo-greenactify.png"
                width="500"
                height="320"
                alt="Green Actify Logo"
                className="object-contain w-full h-full drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Platform untuk meningkatkan kesadaran lingkungan melalui aktivitas
              ramah lingkungan dan kompetisi berkelanjutan.
            </p>
          </blockquote>
          <footer className="mt-4">
            <strong>#GoGreenTogether</strong>
          </footer>
        </div>
      </div>

      <div
        className="flex h-full items-center justify-center p-4 lg:p-8 bg-greenDark"
      >
        <div className="flex w-full max-w-md flex-col items-center justify-center space-y-6">
          <div className="text-center"></div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
