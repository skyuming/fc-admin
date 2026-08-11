import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 上传文件
 *
 * @param file
 */
export function uploadFileApi(file: File): AxiosPromise<string> {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/auth/api/manager/file/singleupload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 删除文件
 *
 * @param filePath 文件完整路径
 */
export function deleteFileApi(filePath?: string) {
  return request({
    url: '/api/v1/files',
    method: 'delete',
    params: { filePath: filePath }
  });
}
