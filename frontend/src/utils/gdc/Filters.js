export const WARNING_FILTER = Object.freeze(
    {
      heading: 'Error/Warnings',
      id: 'warnings',
      multiple: false,
      key: 'warnings',
      filterOptions: [
        {
          title: 'Has Errors',
          id: 'hasErrors',
          value: 'ERROR'
        },
        {
          title: 'Has Warnings',
          id: 'hasWarning',
          value: 'WARNING'
        }
      ]
    }
  );

  export const FILE_TYPE_FILTER = Object.freeze(
    {
      heading: 'File Type',
      id: 'filetype',
      multiple: false,
      key: 'filetype',
      filterOptions: [
        {
          title: 'DEM',
          id: 'DEM-ERROR',
          value: 'DEM-ERROR'
        },
        {
          title: 'CRS',
          id: 'CRS-ERROR',
          value: 'CRS-ERROR'
        },
        {
          title: 'XAM',
          id: 'XAM-ERROR',
          value: 'XAM-ERROR'
        }
      ]
    }
  );

  export const ERROR_REPORT_FILTERS = Object.freeze(
    {
        allowedFilters : {
            fileType: FILE_TYPE_FILTER,
            warnings: WARNING_FILTER,
        }
    }
)