export default function WarnaDemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-whiteMint">
      <h1 className="text-4xl font-bold text-greenDark mb-6">
        Demo Warna Tailwind Custom (oklch & HEX)
      </h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-mintPastel text-greenDark shadow">
          bg-mintPastel <br />
          oklch(0.9031 0.0642 128.87) <br />
          #D2E8BB
        </div>
        <div className="p-6 rounded-lg bg-oliveSoft text-black shadow">
          bg-oliveSoft <br />
          oklch(0.6355 0.0706 148.47) <br />
          #6D9773
        </div>
        <div className="p-6 rounded-lg bg-greenDark text-whiteMint shadow">
          bg-greenDark <br />
          oklch(0.3172 0.0549 170.43) <br />
          #0C3B2E
        </div>
        <div className="p-6 rounded-lg bg-yellowAmber text-black shadow">
          bg-yellowAmber <br />
          oklch(0.7211 0.153585 73.0139) <br />
          #DE9300
        </div>
        <div className="p-6 rounded-lg bg-yellowGold text-black shadow">
          bg-yellowGold <br />
          oklch(0.8309 0.171389 81.5486) <br />
          #FFBA00
        </div>
        <div className="p-6 rounded-lg bg-tealLight text-white shadow">
          bg-tealLight <br />
          oklch(0.6881 0.1118 182.85) <br />
          #2EB1A1
        </div>
        <div className="p-6 rounded-lg bg-black text-whiteMint shadow">
          bg-black <br />
          oklch(0.15 0.01 0.0) <br />
          #000000
        </div>
        <div className="p-6 rounded-lg bg-whiteMint text-greenDark shadow border border-greenDark">
          bg-whiteMint <br />
          oklch(0.9864 0.0215 149.72) <br />
          #F1FFF3
        </div>
        <div className="p-6 rounded-lg bg-whiteGreen text-greenDark shadow border border-greenDark">
          bg-whiteGreen <br />
          oklch(0.9529 0.0376 148.92) <br />
          #DFF7E2
        </div>
        <div className="p-6 rounded-lg bg-red text-white shadow">
          bg-red <br />
          oklch(0.628 0.2577 29.23) <br />
          #FF0000
        </div>
        <div className="p-6 rounded-lg bg-oliveDark text-whiteMint shadow">
          bg-oliveDark <br />
          oklch(0.5204 0.117552 114.6098) <br />
          #687000
        </div>
        <div className="p-6 rounded-lg bg-pinkSoft text-greenDark shadow">
          bg-pinkSoft <br />
          oklch(0.8681 0.039 58.37) <br />
          #E8CEBB
        </div>
      </div>
    </div>
  );
}