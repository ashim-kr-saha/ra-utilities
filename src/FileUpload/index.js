import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FileInput, addField } from 'react-admin';
import { connect } from 'react-redux';
import { getFormValues, change, arrayRemoveAll } from 'redux-form';
import UploadingFileField from './UploadingFileField';

const REDUX_FORM_NAME = 'record-form';
const AbortController = window.AbortController;

export class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.abortControllers = {};
    this.currentFiles = [];
    this.deletedFiles = [];
    this.filesToUpload = [];
    this.alreadyRegistered = {};
    this.alreadyUploaded = {};
    this.uploadedFiles = [];
    this.uploading = false;
    this.state = { uploading: false };
    this.onChange = this.onChange.bind(this);
  }
  removeRegisteredFile = key => {
    if (this.alreadyRegistered[key]) {
      this.filesToUpload = this.filesToUpload.filter(file => file.src !== key);
    }
  };

  removeUploadedFiles = key => {
    this.uploadedFiles = this.uploadedFiles.filter(file => file.src !== key);
  };

  abortUploadingForDeletedFiles = (fileArray1, fileArray2) => {
    var fileMap = {};
    var i = 0;
    for (i = 0; i < fileArray2.length; i++) {
      fileMap[fileArray2[i].src] = true;
    }

    for (i = 0; i < fileArray1.length; i++) {
      var src = fileArray1[i].src;
      if (!fileMap[src]) {
        this.removeRegisteredFile(src);
        this.abortFileUpload(src);
        this.removeUploadedFiles(src);
      }
    }
  };

  getNewAbortControllerSignal = key => {
    this.abortControllers[key] = new AbortController();
    return this.abortControllers[key].signal;
  };

  abortFileUpload = key => {
    var controller = this.abortControllers[key];
    if (controller !== undefined) {
      this.abortControllers[key].abort();
      delete this.abortControllers[key];
    }
  };

  getNewFormData = file => {
    var data = new FormData();
    data.append(file.src, file.rawFile, file.title);
    return data;
  };

  registerFilesToUpload = files => {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (
        !this.alreadyRegistered[file.src] &&
        !this.alreadyUploaded[file.src]
      ) {
        // Only new files to be registered
        if (file.rawFile) {
          this.alreadyRegistered[file.src] = true;
          this.filesToUpload.push(file);
        } else {
          // Already files coming form db src
          this.uploadedFiles.push(file);
        }
      }
    }
  };

  updateReduxForm = () => {
    var allFiles = [...this.uploadedFiles, ...this.filesToUpload];
    this.props.change(this.props.form, this.props.source, allFiles);
  };

  changeCurrentFileSource = (oldSrc, newSrc) => {
    for (var i = 0; i < this.currentFiles.length; i++) {
      if (this.currentFiles[i].src === oldSrc) {
        this.currentFiles[i].src = newSrc;
      }
    }
  };

  startUploading = async apiEndpoint => {
    if (!this.uploading) {
      this.uploading = true;
      this.props.onUploadingStarted();
      if (this.filesToUpload.length === 0) {
        await this.updateReduxForm();
      }
      while (this.filesToUpload.length > 0) {
        var file = this.filesToUpload[0];
        if (file.rawFile === undefined) {
          // do extra check so that there is no infinite loop
        } else {
          try {
            var response = await fetch(apiEndpoint + '/files/upload', {
              method: 'POST',
              credentials: 'include',
              body: this.getNewFormData(file),
              signal: this.getNewAbortControllerSignal(file.src)
            });
            if (response.ok) {
              var json = await response.json();
              this.uploadedFiles.push(json[0]);
              this.removeRegisteredFile(file.src);
              this.alreadyUploaded[json[0].src] = true;
              this.changeCurrentFileSource(file.src, json[0].src);
              await this.updateReduxForm();
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      this.props.onUploadingCompleted();
      this.uploading = false;
    }
  };
  onChange = async files => {
    const { apiEndpoint } = this.props;

    this.abortUploadingForDeletedFiles(this.currentFiles, files);
    this.currentFiles = files;

    this.registerFilesToUpload(files);
    this.startUploading(apiEndpoint);
  };

  render() {
    const { fileProps, apiEndpoint, ...rest } = this.props;
    rest.input.onChange = this.onChange;
    if (!fileProps.srcPrefix) {
      fileProps.srcPrefix = apiEndpoint + '/files/';
    }
    return (
      <FileInput {...rest}>
        <UploadingFileField {...fileProps} />
      </FileInput>
    );
  }
}

FileUpload.propTypes = {
  fileProps: PropTypes.object.isRequired,
  source: PropTypes.string,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  dataProvider: PropTypes.func.isRequired,
  form: PropTypes.string.isRequired,
  apiEndpoint: PropTypes.string.isRequired,
  onUploadingCompleted: PropTypes.func,
  onUploadingStarted: PropTypes.func
};

FileUpload.defaultProps = {
  fileProps: {
    source: 'src',
    title: 'title',
    target: '_blank'
  },
  multiple: false,
  form: REDUX_FORM_NAME
};

FileUpload = addField(FileUpload);

const mapStateToProps = state => ({
  formData: getFormValues(REDUX_FORM_NAME)(state)
});

const mapDispatchToProps = dispatch => {
  return {
    change: (form, field, value) => {
      dispatch(change(form, field, value));
    },
    arrayRemoveAll: (form, field) => {
      dispatch(arrayRemoveAll(form, field));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileUpload);
