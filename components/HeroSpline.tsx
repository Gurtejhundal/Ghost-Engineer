"use client";

const defaultSceneUrl = "https://prod.spline.design/aWsvdkNwf6vBYxPU/scene.splinecode";
const stageClassName =
  "relative h-full min-h-[300px] overflow-hidden bg-transparent sm:min-h-[380px] lg:min-h-[560px] xl:min-h-[640px]";

export function HeroSpline() {
  const scene = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL || defaultSceneUrl;
  const srcDoc = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
            background: transparent;
          }

          spline-viewer {
            width: 100%;
            height: 100%;
            display: block;
            background: transparent;
          }
        </style>
      </head>
      <body>
        <spline-viewer loading-anim-type="none" url="${scene}"></spline-viewer>
        <script type="module" src="https://unpkg.com/@splinetool/viewer@1.10.57/build/spline-viewer.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={stageClassName} aria-label="Interactive 3D engineering model">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(0,209,178,0.12),transparent_34%)]" />
      <div className="absolute inset-x-[-8%] inset-y-[-6%] lg:-bottom-20 lg:-top-24 lg:left-[-72%] lg:right-[-4%] xl:-bottom-24 xl:-top-28 xl:left-[-82%] xl:right-[-6%]">
        <iframe
          title="Interactive 3D engineering model"
          srcDoc={srcDoc}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-[#000000]/80 to-[#000000]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#000000] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#000000] to-transparent" />
    </div>
  );
}
