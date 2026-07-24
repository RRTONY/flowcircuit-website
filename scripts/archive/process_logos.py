from PIL import Image, ImageEnhance
import os

def process_image(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Create a grayscale version
        # Split into bands
        r, g, b, a = img.split()
        
        # Convert to grayscale
        gray = img.convert("L")
        
        # Create a new RGBA image with the grayscale version as RGB channels and original alpha
        # This preserves transparency while making the logo grayscale
        new_img = Image.merge("RGBA", (gray, gray, gray, a))
        
        # Make it "soft" by reducing opacity slightly (optional, but requested "soft")
        # Let's reduce opacity to 80% to make them blend better
        # r, g, b, a = new_img.split()
        # a = a.point(lambda p: p * 0.8)
        # new_img = Image.merge("RGBA", (r, g, b, a))
        
        new_img.save(output_path, "PNG")
        print(f"Processed: {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

source_dir = "/home/ubuntu/greg-berry-innovation/client/public/images/logos"
files = os.listdir(source_dir)

for file in files:
    if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        input_path = os.path.join(source_dir, file)
        # Overwrite or save as new? Let's overwrite for simplicity in the app usage, 
        # but maybe keep a backup if needed. For now, overwrite is fine as we have the originals in upload/
        process_image(input_path, input_path)
