import cloudinary
import cloudinary.uploader

# Test with your corrected credentials
cloudinary.config(
    cloud_name="dtxmll4xi",  # No space!
    api_key="434695395151759",
    api_secret="r0n1GhdPLRvAFQ-78jjPJ8b4lYo",
    secure=True
)

try:
    # Test image upload
    result = cloudinary.uploader.upload("https://via.placeholder.com/150", folder="instagram/images")
    print("✅ SUCCESS! Image upload works!")
    print(f"Image uploaded to: {result['url']}")
    
    # Test video upload
    video_result = cloudinary.uploader.upload(
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", 
        resource_type="video",
        folder="instagram/videos"
    )
    print("✅ SUCCESS! Video upload works!")
    print(f"Video uploaded to: {video_result['url']}")
    
except Exception as e:
    print(f"❌ ERROR: {e}")