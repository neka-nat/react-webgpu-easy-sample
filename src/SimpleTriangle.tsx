import React, { useEffect, useRef } from 'react';

import { useWebGPU } from './useWebGPU';

const vertWGSL = `
@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4<f32> {

  var pos = array<vec2<f32>, 3>(
    vec2<f32>(0.0, 0.5),
    vec2<f32>(-0.5, -0.5),
    vec2<f32>(0.5, -0.5)
  );

  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}
`;

const fragWGSL = `
@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`;

export const SimpleTriangle = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { adapter, device, canvas, context, format } = useWebGPU(canvasRef.current);

  useEffect(() => {
    if (!canvas || !context || !adapter || !device) return

    const canvsConfig: GPUCanvasConfiguration = {
        device,
        format,
        alphaMode: 'opaque'
    }
    context.configure(canvsConfig)

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({
          code: vertWGSL,
        }),
        entryPoint: 'main',
      },
      fragment: {
        module: device.createShaderModule({
          code: fragWGSL,
        }),
        entryPoint: 'main',
        targets: [
          // 0
          { // @location(0) in fragment shader
            format: format,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });

    function frame() {
      if (!context || !device) return;

      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();
    
      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store',
          } as GPURenderPassColorAttachment,
        ],
      };
    
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(pipeline);
      passEncoder.draw(3, 1, 0, 0);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }, [canvas, context, format, adapter, device])


  return <canvas ref={canvasRef} />;
};
