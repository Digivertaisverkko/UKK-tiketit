import { FileSizePipe } from "./filesize.pipe";

describe('FilesizePipe', () => {
  it('create an instance', () => {
    const pipe = new FileSizePipe();
    expect(pipe).toBeTruthy();
  });
});
