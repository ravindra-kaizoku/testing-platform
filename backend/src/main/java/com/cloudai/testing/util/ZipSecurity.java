package com.cloudai.testing.util;

import java.io.File;
import java.io.IOException;
import java.util.zip.ZipEntry;

public class ZipSecurity {

    /**
     * Guarantees that the destination file is safe to extract and prevents Zip Slip.
     */
    public static File newFile(File destinationDir, ZipEntry zipEntry) throws IOException {
        File destFile = new File(destinationDir, zipEntry.getName());

        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();

        // Check if the destination path begins with the canonical path of the target directory
        if (!destFilePath.startsWith(destDirPath + File.separator) && !destFilePath.equals(destDirPath)) {
            throw new IOException("Entry is outside of the target directory (Zip Slip attempt): " + zipEntry.getName());
        }

        return destFile;
    }
}
