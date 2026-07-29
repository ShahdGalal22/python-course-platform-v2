export default function VideoPlayer({ lesson }) {
  if (!lesson) return null;
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black shadow-soft">
      <div className="aspect-video w-full">
        <video key={lesson.id} src={lesson.video_url} controls controlsList="nodownload" className="w-full h-full">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
