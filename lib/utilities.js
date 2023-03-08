export const drawRect = (detections, ctx, xRatio) => {
    detections.forEach(predictions=>{
        // Get prediction results
        const [x,y,width,height] = predictions['bbox'];
        const text = predictions['class'];

        // apply ratios (since resolution of file is different than canvas)
        const _x = x * xRatio;
        const _y = y * xRatio;
        const _width = width * xRatio;
        const _height = height * xRatio;


        // Set styling
        const color = 'green'
        ctx.strokeStyle = color
        ctx.font = '18px Arial'
        ctx.fillStyle = color

        // Draw rectangles and text
        ctx.beginPath()
        ctx.fillText(text, _x, _y)
        ctx.rect(_x, _y, _width, _height)
        ctx.stroke()
        
        
    })
}