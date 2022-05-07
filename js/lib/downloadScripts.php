<?php

/**
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Download JavaScript dependencies for OJS plugin OPTIMETA Geoplugin
 * 
 * Prerequisites:
 * 
 * - PHP needs to have the zip extension installed, see https://www.php.net/manual/en/book.zip.php
 * 
 * Usage:
 * 
 * > php -f downloadScripts.php
 * 
 * Debugging:
 * 
 * A debug configuration for VSCode is:
 * 
 * {
 *     "version": "0.2.0",
 *     "configurations": [
 *         {
 *             "name": "Launch currently open script",
 *             "type": "php",
 *             "request": "launch",
 *             "program": "${file}",
 *             "cwd": "${fileDirname}",
 *             "port": 0,
 *             "runtimeArgs": [
 *                 "-dxdebug.start_with_request=yes"
 *             ],
 *             "env": {
 *                 "XDEBUG_MODE": "debug,develop",
 *                 "XDEBUG_CONFIG": "client_port=${port}"
 *             }
 *         },
 *      ]
 *  }
 * 
 * @author Daniel Nüst (OPTIMETA)
 */

# list of download URLs and files that need to be extracted
$libraries = [
    [
        'https://github.com/Leaflet/Leaflet/archive/refs/tags/v1.6.0.zip',
        ['Leaflet-1.6.0/dist/leaflet.css', 'Leaflet-1.6.0/dist/leaflet.js']
    ],
    [
        'https://github.com/Leaflet/Leaflet.draw/archive/refs/tags/v1.0.4.zip',
        ['Leaflet.draw-1.0.4/dist/leaflet.draw.css', 'Leaflet.draw-1.0.4/dist/leaflet.draw.js']
    ],
    [
        'https://github.com/moment/moment/archive/refs/tags/2.18.1.zip',
        ['moment-2.18.1/moment.js']
    ],
    [
        'https://github.com/dangrossman/daterangepicker/archive/refs/tags/v3.1.zip',
        ['daterangepicker-3.1/daterangepicker.css', 'daterangepicker-3.1/daterangepicker.js']
    ],
    // https://github.com/perliedman/leaflet-control-geocoder/archive/refs/tags/2.4.0.zip does not contain the .js file in /dist - see https://github.com/perliedman/leaflet-control-geocoder/issues/310
    [
        'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css',
        'Control.Geocoder.css'
    ],
    [
        'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js',
        'Control.Geocoder.js'
    ]
    // $urlJqueryJS = 'https://code.jquery.com/jquery-3.2.1.js';
    // jquery no need to load, already loaded here: ojs/lib/pkp/classes/template/PKPTemplateManager.inc.php 
];


$destinationPath = getcwd();

if (!is_dir($destinationPath) && !is_writeable($destinationPath)) {
    die("Destination path {$destinationPath} is not writeable.");
} else {
    echo "Downloading to {$destinationPath}:";
    print_r($libraries);
}

foreach ($libraries as $lib) {
    $url = $lib[0];
    $filenames = $lib[1];

    if (substr($url, -3) === 'zip') {
        echo 'Downloading and extracting ' . count($filenames) . " files from {$url}\n";

        $tmp_file = tempnam('.', '');
        file_put_contents($tmp_file, file_get_contents($url));
        $zip = new ZipArchive;

        if ($zip->open($tmp_file)) {

            foreach ($filenames as $filename) {
                $destinationFile = $destinationPath . DIRECTORY_SEPARATOR . basename($filename);

                if (is_file($destinationFile)) {
                    die("File ${destinationFile} exists - please delete it before running this script.");
                }

                echo "Extracting ${filename} from ${tmp_file} and saving to ${destinationFile}\n";
                $fileContents = $zip->getFromName($filename);
                file_put_contents($destinationFile, $fileContents);
            }

            $zip->close();
        } else {
            die("Error opening ZIP file ${tmp_file}");
        }

        unlink($tmp_file);
    } else {
        $destinationFile = $destinationPath . DIRECTORY_SEPARATOR . $lib[1];
        if (is_file($destinationFile)) {
            die("File ${destinationFile} exists - please delete it before running this script.");
        }

        echo "Downloading {$url} to {$destinationFile}\n";
        file_put_contents($destinationFile, file_get_contents($url));
    }
}
